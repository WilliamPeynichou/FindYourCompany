const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Service pour enrichir les données d'entreprises avec emails et téléphones
 * depuis PagesJaunes et autres sources
 */
class EnrichmentService {
  /**
   * Enrichit une liste d'entreprises avec emails et téléphones
   * @param {Array} companies - Liste des entreprises à enrichir
   * @param {Object} options - Options d'enrichissement
   * @param {number} options.limit - Limite du nombre d'entreprises à enrichir (0 = pas de limite, défaut: 20)
   */
  async enrichCompanies(companies, options = {}) {
    const enrichedCompanies = [];
    let blockedBy403 = false;
    
    // Limite configurable (par défaut 20 pour éviter les blocages, mais peut être désactivée)
    const limit = options.limit !== undefined ? options.limit : 20;
    const companiesToEnrich = limit > 0 ? companies.slice(0, limit) : companies;
    
    console.log(`Enrichissement de ${companiesToEnrich.length} entreprises (sur ${companies.length} trouvées)...`);
    
    for (let i = 0; i < companiesToEnrich.length; i++) {
      const company = companiesToEnrich[i];
      try {
        // Afficher la progression tous les 10 éléments ou si moins de 10 entreprises
        if ((i + 1) % 10 === 0 || companiesToEnrich.length <= 10) {
          console.log(`[${i + 1}/${companiesToEnrich.length}] Recherche: ${company.name}`);
        }
        
        // Chercher sur PagesJaunes
        const enriched = await this.searchPagesJaunes(company);
        
        // Vérifier si on a été bloqué (403)
        if (enriched.blocked) {
          blockedBy403 = true;
          console.log(`  ⚠️ PagesJaunes bloque les requêtes (403). Arrêt de l'enrichissement.`);
          break; // Arrêter si on est bloqué
        }
        
        // Si on a trouvé au moins un contact, ajouter
        if (enriched.email || enriched.phone) {
          if (companiesToEnrich.length <= 10) {
            console.log(`  ✓ Trouvé: ${enriched.phone ? 'Tél: ' + enriched.phone : ''} ${enriched.email ? 'Email: ' + enriched.email : ''}`);
          }
          enrichedCompanies.push({
            ...company,
            ...enriched
          });
        }
      } catch (error) {
        console.error(`  ✗ Erreur pour ${company.name}:`, error.message);
        if (error.response?.status === 403) {
          blockedBy403 = true;
          break;
        }
      }
      
      // Délai pour ne pas surcharger (augmenté pour éviter les blocages)
      if (i < companiesToEnrich.length - 1 && !blockedBy403) {
        await this.delay(2000); // 2 secondes entre chaque requête pour éviter les blocages
      }
    }
    
    // Si bloqué, lever une erreur spéciale
    if (blockedBy403) {
      const error = new Error('PagesJaunes bloque les requêtes automatisées (403 Forbidden)');
      error.blocked = true;
      throw error;
    }
    
    return enrichedCompanies;
  }

  /**
   * Recherche une entreprise sur PagesJaunes
   */
  async searchPagesJaunes(company) {
    try {
      // Construire la requête de recherche
      const searchQuery = `${company.name} ${company.city}`;
      const encodedQuery = encodeURIComponent(searchQuery);
      
      const url = `https://www.pagesjaunes.fr/recherche/${encodedQuery}`;
      
      // Ne pas logger l'URL pour éviter le spam dans les logs
      // console.log(`    URL: ${url}`);
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Referer': 'https://www.pagesjaunes.fr/',
          'Origin': 'https://www.pagesjaunes.fr',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        },
        timeout: 20000,
        maxRedirects: 5,
        validateStatus: function (status) {
          // Ne pas lever d'erreur pour 403, on le gère manuellement
          return status < 500;
        }
      });

      // Vérifier immédiatement si on a été bloqué
      if (response.status === 403) {
        console.error(`    ⚠️ PagesJaunes bloque la requête (403 Forbidden)`);
        return { phone: null, email: null, website: null, blocked: true };
      }

      const $ = cheerio.load(response.data);
      const result = {
        phone: null,
        email: null,
        website: company.website || null
      };

      // Essayer plusieurs sélecteurs pour le téléphone
      const phoneSelectors = [
        '.tel',
        '.coordonnees .tel',
        '[data-phone]',
        '.bloc-resultat .tel',
        '.result-item .tel',
        'a[href^="tel:"]'
      ];

      for (const selector of phoneSelectors) {
        const phoneElement = $(selector).first();
        if (phoneElement.length) {
          let phone = phoneElement.text().trim() || phoneElement.attr('href')?.replace('tel:', '') || phoneElement.attr('data-phone');
          if (phone) {
            phone = phone.replace(/\s/g, '').replace(/\./g, '');
            if (phone.length >= 10) {
              result.phone = phone;
              break;
            }
          }
        }
      }

      // Essayer plusieurs sélecteurs pour l'email
      const emailSelectors = [
        'a[href^="mailto:"]',
        '.email',
        '.coordonnees .email',
        '[data-email]'
      ];

      for (const selector of emailSelectors) {
        const emailElement = $(selector).first();
        if (emailElement.length) {
          const email = emailElement.attr('href')?.replace('mailto:', '') || emailElement.text().trim() || emailElement.attr('data-email');
          if (email && email.includes('@')) {
            result.email = email;
            break;
          }
        }
      }

      // Essayer plusieurs sélecteurs pour le site web
      const websiteSelectors = [
        '.site-web a',
        '.siteweb a',
        'a[href^="http"]:not([href*="pagesjaunes"])',
        '.bloc-resultat a[target="_blank"]'
      ];

      for (const selector of websiteSelectors) {
        const websiteElement = $(selector).first();
        if (websiteElement.length) {
          const href = websiteElement.attr('href');
          if (href && href.startsWith('http') && !href.includes('pagesjaunes')) {
            result.website = href;
            break;
          }
        }
      }

      return result;
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        if (status === 403) {
          console.error(`    ⚠️ PagesJaunes bloque la requête (403 Forbidden) - Scraping bloqué`);
          return { phone: null, email: null, website: null, blocked: true };
        } else if (status === 429) {
          // Rate limit - attendre un peu plus longtemps
          console.error(`    ⚠️ Trop de requêtes (429 Too Many Requests)`);
          await this.delay(5000); // Attendre 5 secondes
          return { phone: null, email: null, website: null };
        } else {
          console.error(`    Erreur HTTP ${status}: ${error.response.statusText}`);
        }
      } else if (error.code === 'ECONNABORTED') {
        console.error(`    ⚠️ Timeout lors de la requête`);
      } else {
        console.error(`    Erreur: ${error.message}`);
      }
      return { phone: null, email: null, website: null };
    }
  }

  /**
   * Génère un email probable basé sur le nom de l'entreprise
   * Fallback si le scraping ne fonctionne pas
   */
  generateProbableEmail(company) {
    if (!company.name || !company.city) return null;
    
    // Nettoyer le nom pour créer un email
    const cleanName = company.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
      .replace(/[^a-z0-9]/g, '') // Garder seulement lettres et chiffres
      .substring(0, 20);
    
    const domains = ['contact', 'info', 'commercial', 'service'];
    return `${cleanName}@${domains[0]}.fr`;
  }

  /**
   * Délai pour éviter de surcharger les serveurs
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new EnrichmentService();
