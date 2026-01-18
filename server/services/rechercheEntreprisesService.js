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
   * Mapping complet des secteurs vers les codes NAF
   * Synchronisé avec le frontend SectorSelect.jsx
   */
  getSectorNafCodes(sectorId) {
    const sectorMap = {
      'tech': ['62.01Z', '62.02A', '62.02B', '62.03Z', '62.09Z', '63.11Z', '63.12Z', '58.21Z', '58.29A', '58.29B', '58.29C'],
      'btp': ['41.20A', '41.20B', '43.11Z', '43.12A', '43.12B', '43.21A', '43.21B', '43.22A', '43.22B', '43.31Z', '43.32A', '43.32B', '43.33Z', '43.34Z', '43.39Z', '43.91A', '43.91B', '43.99A', '43.99B', '43.99C', '43.99D', '43.99E'],
      'sante': ['86.10Z', '86.21Z', '86.22A', '86.22B', '86.22C', '86.23Z', '86.90A', '86.90B', '86.90C', '86.90D', '86.90E', '86.90F'],
      'social': ['87.10A', '87.10B', '87.10C', '87.20A', '87.20B', '87.30A', '87.30B', '88.10A', '88.10B', '88.10C', '88.91A', '88.91B', '88.99A', '88.99B'],
      'commerce': ['47.11A', '47.11B', '47.11C', '47.11D', '47.11E', '47.11F', '47.19A', '47.19B', '47.21Z', '47.22Z', '47.23Z', '47.24Z', '47.25Z', '47.26Z', '47.29Z', '47.30Z', '47.41Z', '47.42Z', '47.43Z', '47.51Z', '47.52A', '47.52B', '47.53Z', '47.54Z', '47.59A', '47.59B', '47.61Z', '47.62Z', '47.63Z', '47.64Z', '47.65Z', '47.71Z', '47.72A', '47.72B', '47.73Z', '47.74Z', '47.75Z', '47.76Z', '47.77Z', '47.78A', '47.78B', '47.78C', '47.79Z'],
      'commerce-gros': ['46.11Z', '46.12A', '46.12B', '46.13Z', '46.14Z', '46.15Z', '46.16Z', '46.17A', '46.17B', '46.18Z', '46.19A', '46.19B', '46.21Z', '46.22Z', '46.23Z', '46.24Z', '46.31Z', '46.32A', '46.32B', '46.32C', '46.33Z', '46.34Z', '46.35Z', '46.36Z', '46.37Z', '46.38A', '46.38B', '46.39A', '46.39B'],
      'restauration': ['56.10A', '56.10B', '56.10C', '56.21Z', '56.29A', '56.29B', '56.30Z'],
      'hotellerie': ['55.10Z', '55.20Z', '55.30Z', '55.90Z'],
      'banque': ['64.11Z', '64.19Z', '64.20Z', '64.30Z', '64.91Z', '64.92Z', '64.99Z', '66.11Z', '66.12Z', '66.19A', '66.19B', '66.21Z', '66.22Z', '66.29Z', '66.30Z'],
      'assurance': ['65.11Z', '65.12Z', '65.20Z', '65.30Z'],
      'industrie': ['25.11Z', '25.12Z', '25.21Z', '25.29Z', '25.30Z', '25.40Z', '25.50A', '25.50B', '25.61Z', '25.62A', '25.62B', '25.71Z', '25.72Z', '25.73A', '25.73B', '25.91Z', '25.92Z', '25.93Z', '25.94Z', '25.99A', '25.99B', '28.11Z', '28.12Z', '28.13Z', '28.14Z', '28.15Z', '28.21Z', '28.22Z', '28.23Z', '28.24Z', '28.25Z', '28.29A', '28.29B'],
      'agriculture': ['01.11Z', '01.12Z', '01.13Z', '01.14Z', '01.15Z', '01.16Z', '01.19Z', '01.21Z', '01.22Z', '01.23Z', '01.24Z', '01.25Z', '01.26Z', '01.27Z', '01.28Z', '01.29Z', '01.30Z', '01.41Z', '01.42Z', '01.43Z', '01.44Z', '01.45Z', '01.46Z', '01.47Z', '01.49Z', '01.50Z', '01.61Z', '01.62Z', '01.63Z', '01.64Z', '01.70Z'],
      'transport': ['49.10Z', '49.20Z', '49.31Z', '49.32Z', '49.39A', '49.39B', '49.39C', '49.41A', '49.41B', '49.41C', '49.42Z', '49.50Z', '50.10Z', '50.20Z', '50.30Z', '50.40Z', '51.10Z', '51.21Z'],
      'logistique': ['52.10A', '52.10B', '52.21Z', '52.22Z', '52.23Z', '52.24A', '52.24B', '52.29A', '52.29B'],
      'conseil': ['70.10Z', '70.21Z', '70.22Z'],
      'juridique': ['69.10Z'],
      'comptabilite': ['69.20Z'],
      'immobilier': ['68.10Z', '68.20A', '68.20B', '68.31Z', '68.32A', '68.32B'],
      'communication': ['73.11Z', '73.12Z', '73.20Z'],
      'design': ['74.10Z', '74.20Z', '74.30Z'],
      'formation': ['85.10Z', '85.20Z', '85.31Z', '85.32Z', '85.41Z', '85.42Z', '85.51Z', '85.52Z', '85.53Z', '85.59A', '85.59B', '85.60Z'],
      'beaute': ['96.02A', '96.02B', '96.04Z', '96.09Z'],
      'sport': ['93.11Z', '93.12Z', '93.13Z', '93.19Z', '93.21Z', '93.29Z'],
      'reparation': ['33.11Z', '33.12Z', '33.13Z', '33.14Z', '33.15Z', '33.16Z', '33.17Z', '33.19Z', '33.20A', '33.20B', '33.20C', '33.20D', '45.20A', '45.20B', '95.11Z', '95.12Z', '95.21Z', '95.22Z', '95.23Z', '95.24Z', '95.25Z', '95.29Z'],
      'nettoyage': ['81.21Z', '81.22Z', '81.29A', '81.29B'],
      'securite': ['80.10Z', '80.20Z', '80.30Z']
    };
    return sectorMap[sectorId] || null;
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
   * Récupère les communes dans un rayon donné autour d'un point
   * Utilise l'API Geo pour une recherche plus précise
   */
  async getCommunesInRadius(centerLat, centerLon, radiusKm) {
    try {
      // L'API Geo ne supporte pas la recherche par rayon directement
      // On récupère les communes environnantes via une requête géographique
      const response = await axios.get('https://geo.api.gouv.fr/communes', {
        params: {
          lat: centerLat,
          lon: centerLon,
          fields: 'code,nom,codesPostaux,centre',
          format: 'json',
          geometry: 'centre'
        },
        timeout: 10000
      });

      // Filtrer les communes par distance
      const communesInRadius = [];
      for (const commune of response.data) {
        if (commune.centre && commune.centre.coordinates) {
          const distance = this.calculateDistance(
            centerLat, centerLon,
            commune.centre.coordinates[1],
            commune.centre.coordinates[0]
          );
          if (distance <= radiusKm) {
            communesInRadius.push({
              ...commune,
              distance: Math.round(distance * 10) / 10
            });
          }
        }
      }

      return communesInRadius;
    } catch (error) {
      console.error('Erreur récupération communes:', error.message);
      return [];
    }
  }

  /**
   * Recherche des entreprises via l'API Recherche Entreprises
   * @param {Object} params - Paramètres de recherche
   * @param {string} params.city - Nom de la ville
   * @param {string} params.postcode - Code postal
   * @param {string} params.sector - ID du secteur d'activité
   * @param {number} params.radius - Rayon de recherche en km
   * @param {number} params.centerLat - Latitude du centre
   * @param {number} params.centerLon - Longitude du centre
   */
  async searchCompanies({ city, postcode, sector, radius = 5, centerLat, centerLon }) {
    try {
      console.log('🔍 Recherche API Gouv...', { city, postcode, sector, radius });

      // Récupérer les codes NAF pour le secteur
      const nafCodes = this.getSectorNafCodes(sector);
      
      // Construire les paramètres de base
      const baseParams = {
        page: 1,
        per_page: 25, // Maximum autorisé par l'API
        etat_administratif: 'A' // Seulement les entreprises actives
      };

      // Ajouter le filtre par code postal
      if (postcode) {
        baseParams.code_postal = postcode;
      }

      let allResults = [];

      // Si on a des codes NAF, faire des recherches par code
      if (nafCodes && nafCodes.length > 0) {
        console.log(`📊 Recherche avec ${nafCodes.length} codes NAF pour le secteur "${sector}"`);
        
        // Limiter à 5 codes NAF les plus pertinents pour éviter trop de requêtes
        const codesToSearch = nafCodes.slice(0, 5);
        
        for (const nafCode of codesToSearch) {
          try {
            const params = {
              ...baseParams,
              activite_principale: nafCode
            };

            console.log(`   🔎 Code NAF: ${nafCode}`);

            const response = await axios.get(`${this.baseURL}/search`, {
              params,
              timeout: 15000
            });

            if (response.data.results) {
              allResults.push(...response.data.results);
            }

            // Petit délai entre les requêtes
            await this.delay(100);
          } catch (err) {
            console.warn(`   ⚠️ Erreur pour code NAF ${nafCode}:`, err.message);
          }
        }

        // Dédupliquer par SIREN
        const uniqueResults = Array.from(
          new Map(allResults.map(item => [item.siren, item])).values()
        );
        allResults = uniqueResults;

        console.log(`📊 Total: ${allResults.length} entreprises uniques trouvées`);

      } else {
        // Recherche sans filtre de secteur
        console.log('📊 Recherche sans filtre de secteur');
        
        const params = {
          ...baseParams,
          q: city || '*'
        };

        const response = await axios.get(`${this.baseURL}/search`, {
          params,
          timeout: 15000
        });

        allResults = response.data.results || [];
        console.log(`📊 ${allResults.length} entreprises trouvées`);
      }

      // Transformer les résultats
      const companies = allResults.map(ent => this.transformData(ent));

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
   * Retourne le libellé du code NAF
   */
  getNafLabel(codeNaf) {
    const nafLabels = {
      // Informatique
      '62.01Z': 'Programmation informatique',
      '62.02A': 'Conseil en systèmes informatiques',
      '62.02B': 'Tierce maintenance informatique',
      '62.03Z': 'Gestion d\'installations informatiques',
      '62.09Z': 'Autres activités informatiques',
      '63.11Z': 'Traitement de données, hébergement',
      '63.12Z': 'Portails Internet',
      // BTP
      '41.20A': 'Construction de maisons individuelles',
      '41.20B': 'Construction d\'autres bâtiments',
      '43.11Z': 'Travaux de démolition',
      '43.21A': 'Travaux d\'installation électrique',
      '43.22A': 'Travaux de plomberie',
      '43.31Z': 'Travaux de plâtrerie',
      '43.32A': 'Travaux de menuiserie bois et PVC',
      '43.34Z': 'Travaux de peinture',
      // Restauration
      '56.10A': 'Restauration traditionnelle',
      '56.10B': 'Cafétérias et libres-services',
      '56.10C': 'Restauration rapide',
      '56.30Z': 'Débits de boissons',
      // Commerce
      '47.11A': 'Commerce de produits surgelés',
      '47.11B': 'Commerce d\'alimentation générale',
      '47.11C': 'Supérettes',
      '47.11D': 'Supermarchés',
      '47.11E': 'Magasins multi-commerces',
      '47.11F': 'Hypermarchés',
      // Conseil
      '70.10Z': 'Activités des sièges sociaux',
      '70.21Z': 'Conseil en relations publiques',
      '70.22Z': 'Conseil pour les affaires',
      // Comptabilité
      '69.20Z': 'Activités comptables',
      '69.10Z': 'Activités juridiques',
      // Santé
      '86.10Z': 'Activités hospitalières',
      '86.21Z': 'Activité des médecins généralistes',
      '86.22A': 'Activité des médecins spécialistes',
      '86.22B': 'Activités de radiodiagnostic',
      '86.22C': 'Autres activités des médecins spécialistes',
      '86.23Z': 'Pratique dentaire',
      // Immobilier
      '68.10Z': 'Activités des marchands de biens',
      '68.20A': 'Location de logements',
      '68.20B': 'Location de terrains et biens immobiliers',
      '68.31Z': 'Agences immobilières',
      '68.32A': 'Administration d\'immeubles',
      '68.32B': 'Supports juridiques de gestion'
    };
    return nafLabels[codeNaf] || null;
  }

  /**
   * Délai pour éviter de surcharger l'API
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new RechercheEntreprisesService();
