import { useState } from 'react';
import axios from 'axios';

// Utiliser le proxy Vite en développement, ou l'URL complète en production
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'http://localhost:3000');

/**
 * Hook pour gérer la logique de recherche
 * Utilise l'API Recherche Entreprises (data.gouv.fr) - GRATUITE
 */
export const useSearch = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [source, setSource] = useState(null);

  const performSearch = async (formData) => {
    setLoading(true);
    setError(null);
    setResults([]);
    setStats(null);
    setSource(null);
    
    try {
      // Vérifier que les données requises sont présentes
      if (!formData.location) {
        throw new Error('Localisation incomplète. Veuillez sélectionner un lieu.');
      }

      // Ville ou code postal requis
      if (!formData.location.postcode && !formData.location.city) {
        throw new Error('Ville ou code postal requis pour la recherche.');
      }

      // Préparer les données pour l'API
      const requestData = {
        location: {
          city: formData.location.city || '',
          postcode: formData.location.postcode || '',
          lat: formData.location.lat || '',
          lon: formData.location.lon || '',
          label: formData.location.label || ''
        },
        radius: formData.radius || 5,
        sector: formData.sector || ''
      };

      console.log('🔍 Envoi de la requête API Gouv:', requestData);

      // Appel API vers le backend - utilise la route API Gouv (gratuite)
      const response = await axios.post(
        `${API_BASE_URL}/api/companies/search-gouv`,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 60000 // 1 minute
        }
      );

      console.log('✅ Réponse API Gouv reçue:', response.data);

      const companies = response.data.companies || [];
      
      console.log(`📊 ${companies.length} entreprises trouvées`);
      
      // Sauvegarder les statistiques
      if (response.data.stats) {
        setStats(response.data.stats);
        console.log(`   - ${response.data.stats.total} total`);
        console.log(`   - ${response.data.stats.withCoordinates} avec coordonnées`);
        console.log(`   - ${response.data.stats.withDirigeants} avec dirigeants`);
      }

      // Sauvegarder la source
      if (response.data.source) {
        setSource(response.data.source);
      }

      setResults(companies);
      setLoading(false);

      // Afficher un message si aucun résultat
      if (companies.length === 0) {
        setError('Aucune entreprise trouvée dans cette zone.');
      }

    } catch (err) {
      console.error('❌ Erreur recherche:', err);
      
      let errorMessage = "Une erreur est survenue lors de la recherche.";
      
      if (err.response) {
        // Erreur HTTP
        errorMessage = err.response.data?.error || err.response.data?.message || `Erreur ${err.response.status}`;
        console.error('Détails erreur:', err.response.data);
      } else if (err.request) {
        // Pas de réponse du serveur
        errorMessage = "Impossible de contacter le serveur. Vérifiez que le backend est démarré.";
        console.error('Pas de réponse du serveur');
      } else if (err.message) {
        // Erreur de validation
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setLoading(false);
      setResults([]);
    }
  };

  return { results, loading, error, stats, source, performSearch };
};
