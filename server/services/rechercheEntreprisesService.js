const axios = require('axios');

/**
 * Service pour interagir avec l'API Recherche Entreprises (data.gouv.fr)
 * API gratuite et sans limite
 * Documentation: https://recherche-entreprises.api.gouv.fr/docs
 */
class RechercheEntreprisesService {
  constructor() {
    this.baseURL = 'https://recherche-entreprises.api.gouv.fr';
  }

  /**
   * Convertit un secteur d'activité en codes NAF complets
   */
  getSectorNafCodes(sector) {
    const sectorMap = {
      'Informatique / Tech': ['62.01Z', '62.02A', '62.02B', '62.03Z', '62.09Z', '63.11Z', '63.12Z'],
      'BTP / Construction': ['43.11Z', '43.12A', '43.12B', '43.21A', '43.21B', '43.22A', '43.22B', '43.31Z', '43.32A', '43.32B', '43.33Z', '43.34Z', '43.39Z', '43.91A', '43.91B', '43.99A', '43.99B', '43.99C', '43.99D', '43.99E', '41.20A', '41.20B'],
      'Santé / Social': ['86.10Z', '86.21Z', '86.22A', '86.22B', '86.22C', '86.23Z', '86.90A', '86.90B', '86.90C', '86.90D', '86.90E', '86.90F', '87.10A', '87.10B', '87.10C', '87.20A', '87.20B', '87.30A', '87.30B', '88.10A', '88.10B', '88.10C', '88.91A', '88.91B', '88.99A', '88.99B'],
      'Commerce / Vente': ['47.11A', '47.11B', '47.11C', '47.11D', '47.11E', '47.11F', '47.19A', '47.19B', '47.21Z', '47.22Z', '47.23Z', '47.24Z', '47.25Z', '47.26Z', '47.29Z', '47.30Z'],
      'Restauration / Hôtellerie': ['56.10A', '56.10B', '56.10C', '56.21Z', '56.29A', '56.29B', '56.30Z', '55.10Z', '55.20Z', '55.30Z', '55.90Z'],
      'Banque / Assurance': ['64.11Z', '64.19Z', '64.20Z', '64.30Z', '64.91Z', '64.92Z', '64.99Z', '65.11Z', '65.12Z', '65.20Z', '65.30Z', '66.11Z', '66.12Z', '66.19A', '66.19B', '66.21Z', '66.22Z', '66.29Z', '66.30Z'],
      'Industrie': ['25.11Z', '25.12Z', '25.21Z', '25.29Z', '25.30Z', '25.40Z', '25.50A', '25.50B', '25.61Z', '25.62A', '25.62B', '25.71Z', '25.72Z', '25.73A', '25.73B', '25.91Z', '25.92Z', '25.93Z', '25.94Z', '25.99A', '25.99B'],
      'Agriculture': ['01.11Z', '01.12Z', '01.13Z', '01.14Z', '01.15Z', '01.16Z', '01.19Z', '01.21Z', '01.22Z', '01.23Z', '01.24Z', '01.25Z', '01.26Z', '01.27Z', '01.28Z', '01.29Z', '01.30Z', '01.41Z', '01.42Z', '01.43Z', '01.44Z', '01.45Z', '01.46Z', '01.47Z', '01.49Z', '01.50Z'],
      'Transport / Logistique': ['49.10Z', '49.20Z', '49.31Z', '49.32Z', '49.39A', '49.39B', '49.39C', '49.41A', '49.41B', '49.41C', '49.42Z', '49.50Z', '52.10A', '52.10B', '52.21Z', '52.22Z', '52.23Z', '52.24A', '52.24B', '52.29A', '52.29B'],
      'Services aux entreprises': ['70.10Z', '70.21Z', '70.22Z', '69.10Z', '69.20Z', '73.11Z', '73.12Z', '73.20Z', '74.10Z', '74.20Z', '74.30Z', '74.90A', '74.90B', '78.10Z', '78.20Z', '78.30Z', '82.11Z', '82.19Z', '82.20Z', '82.30Z', '82.91Z', '82.92Z', '82.99Z']
    };
    return sectorMap[sector] || null;
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
   * Géocode un code postal en coordonnées lat/lon via l'API Adresse
   */
  async geocodePostcode(postcode) {
    try {
      const response = await axios.get('https://api-adresse.data.gouv.fr/search/', {
        params: {
          q: postcode,
          type: 'municipality',
          limit: 1
        },
        timeout: 10000
      });

      if (response.data.features && response.data.features.length > 0) {
        const feature = response.data.features[0];
        return {
          lat: feature.geometry.coordinates[1],
          lon: feature.geometry.coordinates[0],
          city: feature.properties.city || feature.properties.name,
          postcode: feature.properties.postcode
        };
      }
      throw new Error('Code postal non trouvé');
    } catch (error) {
      console.error('Erreur géocodage:', error.message);
      throw new Error(`Impossible de géocoder le code postal: ${postcode}`);
    }
  }

  /**
   * Recherche des entreprises via l'API Recherche Entreprises
   * @param {Object} params - Paramètres de recherche
   * @param {string} params.city - Nom de la ville
   * @param {string} params.postcode - Code postal
   * @param {string} params.sector - Secteur d'activité
   * @param {number} params.radius - Rayon de recherche en km
   * @param {number} params.centerLat - Latitude du centre
   * @param {number} params.centerLon - Longitude du centre
   */
  async searchCompanies({ city, postcode, sector, radius = 5, centerLat, centerLon }) {
    try {
      console.log('🔍 Recherche API Gouv...', { city, postcode, sector, radius });

      // Construire la requête de recherche
      let searchQuery = city || postcode || '*';
      
      const params = {
        q: searchQuery,
        page: 1,
        per_page: 25, // Maximum autorisé par l'API
        etat_administratif: 'A' // Seulement les entreprises actives
      };

      // Ajouter le code NAF si un secteur est spécifié
      const nafCodes = this.getSectorNafCodes(sector);
      if (nafCodes && nafCodes.length > 0) {
        // Prendre le premier code NAF du secteur pour la recherche
        params.activite_principale = nafCodes[0];
      }

      console.log('📡 Appel API Recherche Entreprises avec params:', params);

      const response = await axios.get(`${this.baseURL}/search`, {
        params,
        timeout: 30000
      });

      console.log('📥 Réponse API - Status:', response.status);
      console.log('📊 Total entreprises trouvées:', response.data.total_results);

      const results = response.data.results || [];
      
      // Si pas de résultats avec le code NAF, essayer sans
      if (results.length === 0 && nafCodes) {
        console.log('🔄 Pas de résultats avec le code NAF, recherche élargie...');
        delete params.activite_principale;
        
        const response2 = await axios.get(`${this.baseURL}/search`, {
          params,
          timeout: 30000
        });
        
        results.push(...(response2.data.results || []));
        console.log('📊 Total après recherche élargie:', results.length);
      }

      // Transformer les résultats
      const companies = results.map(ent => this.transformData(ent));

      // Filtrer par rayon si on a les coordonnées du centre
      let filteredCompanies = companies;
      if (centerLat && centerLon && radius) {
        filteredCompanies = companies.filter(company => {
          if (company.lat && company.lon) {
            const distance = this.calculateDistance(
              centerLat, centerLon,
              company.lat, company.lon
            );
            company.distance = Math.round(distance * 10) / 10;
            return distance <= radius;
          }
          // Si pas de coordonnées, on garde l'entreprise si même code postal
          return company.postcode === postcode;
        });

        // Trier par distance
        filteredCompanies.sort((a, b) => (a.distance || 999) - (b.distance || 999));
      }

      console.log(`✅ ${filteredCompanies.length} entreprises dans le rayon de ${radius}km`);

      return filteredCompanies;

    } catch (error) {
      console.error('❌ Erreur API Recherche Entreprises:');
      console.error('   Status:', error.response?.status);
      console.error('   Data:', JSON.stringify(error.response?.data, null, 2));
      console.error('   Message:', error.message);
      
      if (error.response?.status === 400) {
        throw new Error(`Requête invalide: ${error.response?.data?.erreur || error.message}`);
      }
      
      throw new Error(`Erreur lors de la recherche: ${error.message}`);
    }
  }

  /**
   * Transforme les données de l'API en format standard
   */
  transformData(ent) {
    const siege = ent.siege || {};
    
    // Extraire les coordonnées
    let lat = null, lon = null;
    if (siege.latitude && siege.longitude) {
      lat = parseFloat(siege.latitude);
      lon = parseFloat(siege.longitude);
    } else if (siege.coordonnees) {
      const coords = siege.coordonnees.split(',');
      if (coords.length === 2) {
        lat = parseFloat(coords[0]);
        lon = parseFloat(coords[1]);
      }
    }

    // Extraire les dirigeants
    const dirigeants = (ent.dirigeants || []).map(d => ({
      nom: d.nom,
      prenoms: d.prenoms,
      qualite: d.qualite
    }));

    return {
      siren: ent.siren,
      siret: siege.siret || ent.siren,
      name: ent.nom_complet || ent.nom_raison_sociale || 'Entreprise sans nom',
      address: siege.adresse || siege.geo_adresse || 'Adresse non disponible',
      city: siege.libelle_commune || '',
      postcode: siege.code_postal || '',
      sector: ent.activite_principale || '',
      sectorLabel: this.getNafLabel(ent.activite_principale) || '',
      phone: null, // Non disponible dans cette API
      email: null, // Non disponible dans cette API
      website: null, // Non disponible dans cette API
      lat: lat,
      lon: lon,
      dateCreation: ent.date_creation || siege.date_creation || null,
      formeJuridique: ent.nature_juridique || '',
      effectif: siege.tranche_effectif_salarie || '',
      etatAdministratif: ent.etat_administratif || 'A',
      dirigeants: dirigeants,
      source: 'recherche-entreprises.api.gouv.fr'
    };
  }

  /**
   * Retourne le libellé du code NAF (simplifié)
   */
  getNafLabel(codeNaf) {
    const nafLabels = {
      '62.01Z': 'Programmation informatique',
      '62.02A': 'Conseil en systèmes et logiciels informatiques',
      '62.02B': 'Tierce maintenance de systèmes et d\'applications informatiques',
      '62.03Z': 'Gestion d\'installations informatiques',
      '62.09Z': 'Autres activités informatiques',
      '43.11Z': 'Travaux de démolition',
      '43.21A': 'Travaux d\'installation électrique',
      '56.10A': 'Restauration traditionnelle',
      '56.10B': 'Cafétérias et autres libres-services',
      '56.30Z': 'Débits de boissons',
      '47.11A': 'Commerce de détail de produits surgelés',
      '47.11B': 'Commerce d\'alimentation générale',
      '70.22Z': 'Conseil pour les affaires et autres conseils de gestion',
      '69.20Z': 'Activités comptables'
    };
    return nafLabels[codeNaf] || null;
  }
}

module.exports = new RechercheEntreprisesService();
