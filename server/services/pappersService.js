const axios = require('axios');

/**
 * Service pour interagir avec l'API Pappers
 * Documentation: https://www.pappers.fr/api
 */
class PappersService {
  constructor() {
    this.baseURL = 'https://api.pappers.fr/v2';
    this.apiToken = process.env.PAPPERS_API_TOKEN || '';
  }

  /**
   * Géocode un code postal en coordonnées lat/lon
   * Utilise l'API Nominatim (OpenStreetMap)
   */
  async geocodePostcode(postcode) {
    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          postalcode: postcode,
          country: 'France',
          format: 'json',
          limit: 1
        },
        headers: {
          'User-Agent': 'TrouveTaBoite/1.0'
        }
      });

      if (response.data && response.data.length > 0) {
        return {
          lat: parseFloat(response.data[0].lat),
          lon: parseFloat(response.data[0].lon),
          displayName: response.data[0].display_name
        };
      }
      throw new Error('Code postal non trouvé');
    } catch (error) {
      console.error('Erreur géocodage:', error.message);
      throw new Error(`Impossible de géocoder le code postal: ${postcode}`);
    }
  }

  /**
   * Calcule la distance en km entre deux points (formule de Haversine)
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Rayon de la Terre en km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  toRad(deg) {
    return deg * (Math.PI / 180);
  }

  /**
   * Convertit un secteur d'activité en code NAF
   */
  getSectorNafCode(sector) {
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

  /**
   * Recherche des entreprises via l'API Pappers
   * Filtre par code postal, secteur (code NAF), et ne retourne que celles avec email
   */
  async searchCompanies({ postcode, sector, radius, centerLat, centerLon }) {
    try {
      if (!this.apiToken) {
        throw new Error('Token API Pappers manquant. Configurez PAPPERS_API_TOKEN dans .env');
      }

      console.log('🔍 Recherche Pappers...', { postcode, sector, radius });

      // Récupérer le code NAF pour le secteur
      const codeNaf = this.getSectorNafCode(sector);
      
      // Construire les paramètres de recherche selon la doc API Pappers
      const params = {
        api_token: this.apiToken,
        code_postal: postcode,
        par_page: 100,
        page: 1
      };

      // Ajouter le code NAF si un secteur est spécifié
      if (codeNaf) {
        params.code_naf = codeNaf;
      }

      console.log('📡 Appel API Pappers avec params:', { ...params, api_token: '***' });
      console.log('📡 URL complète:', `${this.baseURL}/recherche`);

      const response = await axios.get(`${this.baseURL}/recherche`, {
        params,
        timeout: 30000
      });

      console.log('📥 Réponse API Pappers - Status:', response.status);
      console.log('📥 Réponse API Pappers - Structure:', Object.keys(response.data || {}));

      // L'API Pappers peut retourner différentes structures selon la version
      const resultats = response.data.resultats || response.data.results || response.data || [];
      console.log(`📊 ${Array.isArray(resultats) ? resultats.length : 'structure inattendue'} entreprises trouvées dans Pappers`);

      // Pour chaque entreprise, récupérer les détails avec email
      const companiesWithDetails = await this.getCompaniesDetails(resultats);

      // Filtrer les entreprises avec email ET dans le rayon
      const filteredCompanies = companiesWithDetails.filter(company => {
        // Doit avoir un email
        if (!company.email) {
          return false;
        }

        // Vérifier la distance si on a les coordonnées
        if (company.lat && company.lon && centerLat && centerLon) {
          const distance = this.calculateDistance(
            centerLat, centerLon,
            company.lat, company.lon
          );
          company.distance = Math.round(distance * 10) / 10; // Arrondir à 1 décimale
          return distance <= radius;
        }

        // Si pas de coordonnées, on garde l'entreprise (même code postal)
        return true;
      });

      console.log(`✅ ${filteredCompanies.length} entreprises avec email dans le rayon de ${radius}km`);

      // Trier par distance
      filteredCompanies.sort((a, b) => (a.distance || 999) - (b.distance || 999));

      return filteredCompanies;

    } catch (error) {
      console.error('❌ Erreur API Pappers complète:');
      console.error('   Status:', error.response?.status);
      console.error('   Status Text:', error.response?.statusText);
      console.error('   Data:', JSON.stringify(error.response?.data, null, 2));
      console.error('   Message:', error.message);
      console.error('   URL:', error.config?.url);
      
      if (error.response?.status === 401) {
        throw new Error('Token API Pappers invalide. Vérifiez PAPPERS_API_TOKEN dans .env');
      }
      if (error.response?.status === 402) {
        throw new Error('Quota API Pappers épuisé. Vérifiez votre abonnement.');
      }
      if (error.response?.status === 403) {
        throw new Error('Accès refusé par l\'API Pappers. Vérifiez votre token et vos permissions.');
      }
      if (error.response?.status === 404) {
        throw new Error('Endpoint API Pappers non trouvé. Vérifiez l\'URL de l\'API.');
      }
      if (error.response?.status === 429) {
        throw new Error('Trop de requêtes à l\'API Pappers. Attendez quelques minutes.');
      }
      if (error.response?.status === 400) {
        const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Requête invalide';
        throw new Error(`Erreur de requête API Pappers: ${errorMsg}`);
      }
      
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message;
      throw new Error(`Erreur lors de la recherche Pappers: ${errorMessage}`);
    }
  }

  /**
   * Récupère les détails de chaque entreprise (notamment l'email)
   */
  async getCompaniesDetails(entreprises) {
    const companiesWithDetails = [];
    
    // Limiter à 50 entreprises pour éviter trop d'appels API
    const limitedEntreprises = entreprises.slice(0, 50);
    
    console.log(`📋 Récupération des détails pour ${limitedEntreprises.length} entreprises...`);

    for (const ent of limitedEntreprises) {
      try {
        // Appel API pour les détails avec champs supplémentaires
        const detailResponse = await axios.get(`${this.baseURL}/entreprise`, {
          params: {
            api_token: this.apiToken,
            siren: ent.siren,
            champs_supplementaires: 'contacts'
          },
          timeout: 10000
        });

        const detail = detailResponse.data;
        
        // Extraire l'email depuis différentes sources possibles
        let email = null;
        
        // Email direct de l'entreprise
        if (detail.email) {
          email = detail.email;
        }
        // Email depuis les contacts
        else if (detail.contacts && detail.contacts.length > 0) {
          const contactWithEmail = detail.contacts.find(c => c.email);
          if (contactWithEmail) {
            email = contactWithEmail.email;
          }
        }
        // Email depuis le site web (pattern commun)
        else if (detail.site_web) {
          // On pourrait essayer de déduire un email du domaine
        }

        // Récupérer les coordonnées depuis le siège
        let lat = null, lon = null;
        if (detail.siege && detail.siege.latitude && detail.siege.longitude) {
          lat = parseFloat(detail.siege.latitude);
          lon = parseFloat(detail.siege.longitude);
        }

        companiesWithDetails.push({
          siren: ent.siren,
          siret: detail.siege?.siret || ent.siret,
          name: detail.nom_entreprise || detail.denomination || ent.nom_entreprise,
          address: this.formatAddress(detail.siege),
          city: detail.siege?.ville || '',
          postcode: detail.siege?.code_postal || '',
          sector: detail.libelle_code_naf || '',
          codeNaf: detail.code_naf || '',
          phone: detail.telephone || null,
          email: email,
          website: detail.site_web || null,
          lat: lat,
          lon: lon,
          dateCreation: detail.date_creation || null,
          formeJuridique: detail.forme_juridique || '',
          effectif: detail.effectif || '',
          source: 'pappers'
        });

        // Petit délai pour ne pas surcharger l'API
        await this.delay(100);

      } catch (error) {
        console.error(`  ⚠️ Erreur détails pour ${ent.siren}:`, error.message);
        // Continuer avec les autres entreprises
      }
    }

    return companiesWithDetails;
  }

  /**
   * Formate l'adresse à partir des données Pappers
   */
  formatAddress(siege) {
    if (!siege) return 'Adresse non disponible';
    
    const parts = [
      siege.numero_voie,
      siege.type_voie,
      siege.libelle_voie,
      siege.code_postal,
      siege.ville
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(' ') : 'Adresse non disponible';
  }

  /**
   * Délai pour éviter de surcharger l'API
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new PappersService();
