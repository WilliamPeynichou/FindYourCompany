const axios = require('axios');

/**
 * Service pour interagir avec l'API Sirene de l'INSEE
 */
class SireneService {
  constructor() {
    this.baseURL = 'https://api.insee.fr/api-sirene/3.11';
    this.apiKey = process.env.INSEE_API_KEY || '';
  }

  /**
   * Recherche d'entreprises par localisation et secteur
   */
  async searchCompanies({ city, postcode, sector, radius, lat, lon }) {
    try {
      // Construire la requête de recherche
      // L'API Sirene utilise le code postal dans le champ codePostalEtablissement
      let query = '';
      
      // Protection contre les injections : utiliser uniquement des valeurs validées
      // Les paramètres sont déjà sanitizés par express-validator
      if (postcode) {
        // S'assurer que le code postal ne contient que des chiffres
        const cleanPostcode = String(postcode).replace(/[^0-9]/g, '');
        if (cleanPostcode.length === 5) {
          query += `codePostalEtablissement:${cleanPostcode}`;
        }
      } else if (city) {
        // Échapper les guillemets pour éviter les injections
        const cleanCity = String(city).replace(/["']/g, '').trim();
        if (cleanCity.length > 0 && cleanCity.length <= 100) {
          query += `libelleCommuneEtablissement:"${cleanCity}"`;
        }
      }

      // Ajouter le secteur d'activité si fourni
      if (sector) {
        // Convertir le secteur en code APE/NAF approximatif
        const apeCode = this.getApeCodeFromSector(sector);
        if (apeCode && /^[0-9]{2}$/.test(apeCode)) {
          // S'assurer que le code APE ne contient que des chiffres
          query += ` AND activitePrincipaleUniteLegale:${apeCode}*`;
        }
      }

      if (!this.apiKey) {
        throw new Error('Clé API INSEE manquante. Configurez INSEE_API_KEY dans .env');
      }

      const response = await axios.get(`${this.baseURL}/siret`, {
        params: {
          q: query,
          nombre: 100, // Limite de résultats
          tri: 'dateCreationUniteLegale desc' // Format correct selon la doc API
        },
        headers: {
          'X-INSEE-Api-Key-Integration': this.apiKey,
          'Accept': 'application/json'
        }
      });

      // La structure de réponse peut varier selon l'API
      // Vérifier response.data.etablissements ou response.data.etablissement
      const companies = response.data.etablissements || response.data.etablissement || [];
      
      // Si c'est un seul établissement, le mettre dans un tableau
      const companiesArray = Array.isArray(companies) ? companies : [companies];
      
      // Transformer les données Sirene en format standard
      return companiesArray.map(etab => this.transformSireneData(etab));
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('Clé API INSEE invalide ou manquante. Vérifiez INSEE_API_KEY dans .env');
      }
      if (error.response?.status === 403) {
        console.error('❌ API Sirene: Accès refusé (403)');
        console.error('   Vérifiez que votre clé API INSEE est valide et active');
        console.error('   URL: https://api.insee.fr/catalogue/');
        throw new Error('Accès refusé par l\'API Sirene (403). Vérifiez votre clé API INSEE.');
      }
      if (error.response?.status === 429) {
        throw new Error('Trop de requêtes à l\'API Sirene. Attendez quelques minutes.');
      }
      console.error('Erreur API Sirene:', error.response?.data || error.message);
      throw new Error(`Erreur lors de la recherche Sirene: ${error.message}`);
    }
  }

  /**
   * Transforme les données Sirene en format standard
   * Filtre les valeurs [ND] (Non Disponible)
   */
  transformSireneData(etab) {
    const uniteLegale = etab.uniteLegale || {};
    const adresse = etab.adresseEtablissement || {};
    
    // Fonction helper pour nettoyer les valeurs [ND]
    const cleanValue = (value) => {
      if (!value || value === '[ND]' || value === 'ND') return null;
      return value;
    };
    
    // Construire le nom en évitant [ND]
    let name = cleanValue(uniteLegale.denominationUniteLegale);
    if (!name) {
      const prenom = cleanValue(uniteLegale.prenom1UniteLegale);
      const nom = cleanValue(uniteLegale.nomUniteLegale);
      if (prenom && nom) {
        name = `${prenom} ${nom}`;
      } else {
        name = prenom || nom || 'Entreprise sans nom';
      }
    }
    
    // Construire l'adresse en filtrant les [ND]
    const addressParts = [
      cleanValue(adresse.numeroVoieEtablissement),
      cleanValue(adresse.typeVoieEtablissement),
      cleanValue(adresse.libelleVoieEtablissement),
      cleanValue(adresse.codePostalEtablissement),
      cleanValue(adresse.libelleCommuneEtablissement)
    ].filter(Boolean);
    
    return {
      siret: etab.siret,
      name: name,
      address: addressParts.length > 0 ? addressParts.join(' ') : 'Adresse non disponible',
      city: cleanValue(adresse.libelleCommuneEtablissement) || '',
      postcode: cleanValue(adresse.codePostalEtablissement) || '',
      sector: cleanValue(uniteLegale.activitePrincipaleUniteLegale) || '',
      phone: null, // Sirene ne fournit pas de téléphone
      email: null, // Sirene ne fournit pas d'email
      website: null,
      lat: null,
      lon: null,
      source: 'sirene'
    };
  }

  /**
   * Convertit un secteur d'activité en code APE approximatif
   */
  getApeCodeFromSector(sector) {
    const sectorMap = {
      'Informatique / Tech': '62',
      'BTP / Construction': '43',
      'Santé / Social': '86',
      'Commerce / Vente': '47',
      'Restauration / Hôtellerie': '56',
      'Banque / Assurance': '64',
      'Industrie': '25',
      'Agriculture': '01',
      'Transport / Logistique': '49',
      'Services aux entreprises': '70'
    };
    
    return sectorMap[sector] || null;
  }
}

module.exports = new SireneService();

