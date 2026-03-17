/**
 * Tests 429 — RechercheEntreprisesService
 *
 * Couvre :
 *  1. fetchWithRetry  — retry sur 429 jusqu'à épuisement des tentatives
 *  2. fetchWithRetry  — lecture du header Retry-After
 *  3. fetchWithRetry  — succès au 2e essai après un 429
 *  4. searchCompanies — fallback gracieux si la page 2 renvoie 429
 *  5. searchCompanies — propage une erreur non-429
 */

jest.mock('axios');
const axios = require('axios');

// On importe la classe brute pour pouvoir instancier un objet fresh par test
// Le module exporte une instance singleton ; on contourne en requérant le fichier source
// et en instanciant directement la classe (export intermédiaire via module.exports = new …)
// → on crée une classe locale équivalente pour éviter le singleton

const RechercheEntreprisesService = (() => {
  // Réimporter la classe sans le `new` final
  const mod = require('../services/rechercheEntreprisesService');
  // mod est déjà une instance — on récupère son constructeur
  return mod.constructor;
})();

// Helper : construit une erreur 429 simulant une réponse Axios
const make429 = (retryAfter = null) => {
  const err = new Error('Too Many Requests');
  err.response = {
    status: 429,
    headers: retryAfter ? { 'retry-after': String(retryAfter) } : {},
    data: { message: 'rate limit' }
  };
  return err;
};

// Helper : construit une réponse Axios réussie
const makeOk = (results = [], extra = {}) => ({
  data: { results, total_results: results.length, total_pages: 1, ...extra }
});

// Remplace setTimeout pour ne pas attendre en test
beforeAll(() => {
  jest.useFakeTimers();
});

afterAll(() => {
  jest.useRealTimers();
});

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── Helpers pour avancer les timers pendant les await ───────────────────────
// Axios est mocké de façon synchrone ; les setTimeout internes sont avancés
// en résolvant la promesse + en avançant les fake timers en alternance.

async function runWithTimers(promise) {
  // Avance tous les timers en attente jusqu'à ce que la promesse se règle
  let resolved = false;
  promise.then(() => { resolved = true; }).catch(() => { resolved = true; });

  while (!resolved) {
    await Promise.resolve(); // donne la main à la microtask queue
    jest.runAllTimers();
  }

  return promise;
}

// ─── 1. fetchWithRetry : épuise les retries sur 429 persistant ───────────────
describe('fetchWithRetry', () => {
  test('lève une erreur après avoir épuisé tous les retries sur 429', async () => {
    axios.get.mockRejectedValue(make429());

    const service = new RechercheEntreprisesService();
    const promise = service.fetchWithRetry('http://fake', {}, 3, 100);

    await expect(runWithTimers(promise)).rejects.toMatchObject({
      response: { status: 429 }
    });

    // 3 tentatives au total (retries=3)
    expect(axios.get).toHaveBeenCalledTimes(3);
  });

  // ─── 2. fetchWithRetry : Retry-After header ──────────────────────────────
  test('utilise le header Retry-After comme délai en ms', async () => {
    // Échoue une fois avec Retry-After: 2 (secondes), réussit ensuite
    axios.get
      .mockRejectedValueOnce(make429(2))
      .mockResolvedValueOnce(makeOk());

    const service = new RechercheEntreprisesService();

    let resolvedValue;
    const promise = service
      .fetchWithRetry('http://fake', {}, 3, 500)
      .then(v => { resolvedValue = v; });

    await Promise.resolve();
    jest.advanceTimersByTime(2000); // avance exactement Retry-After * 1000
    await Promise.resolve();
    jest.runAllTimers();
    await promise;

    expect(resolvedValue).toBeDefined();
    expect(axios.get).toHaveBeenCalledTimes(2);
  });

  // ─── 3. fetchWithRetry : succès au 2e essai ──────────────────────────────
  test('réussit au 2e essai après un 429 sans Retry-After', async () => {
    axios.get
      .mockRejectedValueOnce(make429())
      .mockResolvedValueOnce(makeOk([{ siren: '123456789' }]));

    const service = new RechercheEntreprisesService();

    let result;
    const promise = service
      .fetchWithRetry('http://fake', {}, 3, 100)
      .then(v => { result = v; });

    await Promise.resolve();
    jest.runAllTimers();
    await Promise.resolve();
    jest.runAllTimers();
    await promise;

    expect(result.data.results).toHaveLength(1);
    expect(axios.get).toHaveBeenCalledTimes(2);
  });
});

// ─── 4. searchCompanies : fallback page 1 si page 2 retourne 429 ─────────────
describe('searchCompanies — fallback 429 sur page 2', () => {
  test('retourne les résultats de la page 1 si la page 2 reçoit un 429', async () => {
    const page1Results = [{ siren: '111111111', siege: {}, matching_etablissements: [] }];

    // Géocodage
    axios.get
      // page 1 → ok avec 2 pages disponibles
      .mockResolvedValueOnce({
        data: {
          results: page1Results,
          total_results: 50,
          total_pages: 2
        }
      })
      // page 2 → 429
      .mockRejectedValueOnce(make429())
      .mockRejectedValueOnce(make429())
      .mockRejectedValueOnce(make429())
      .mockRejectedValueOnce(make429()); // 4 retries épuisés

    const service = new RechercheEntreprisesService();

    let result;
    const promise = service.searchCompanies({
      postcode: '35000',
      sector: '',
      radius: 10,
      centerLat: 48.1,
      centerLon: -1.7,
      startPage: 1
    }).then(v => { result = v; });

    // Avance les timers pour les retries de fetchWithRetry sur la page 2
    for (let i = 0; i < 10; i++) {
      await Promise.resolve();
      jest.runAllTimers();
    }
    await promise;

    // Doit retourner les résultats de la page 1 sans planter
    expect(result.companies).toHaveLength(1);
    expect(result.nextStartPage).toBeNull(); // pas de page suivante disponible
  });
});

// ─── 5. searchCompanies : propage les erreurs non-429 ────────────────────────
describe('searchCompanies — erreurs non-429', () => {
  test('propage une erreur 500', async () => {
    const err500 = new Error('Internal Server Error');
    err500.response = { status: 500, data: {} };

    axios.get.mockRejectedValue(err500);

    const service = new RechercheEntreprisesService();
    const promise = service.searchCompanies({
      postcode: '75001',
      sector: '',
      radius: 5,
      centerLat: 48.86,
      centerLon: 2.35,
      startPage: 1
    });

    await expect(runWithTimers(promise)).rejects.toThrow('Erreur lors de la recherche');
  });
});
