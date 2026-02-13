import { useState } from 'react';
import axios from 'axios';

// Utiliser le proxy Vite en développement, ou l'URL de l'API en production
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Hook pour gérer la logique de recherche
 */
export const useSearch = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const performSearch = async (formData) => {
    setLoading(true);
    setError(null);
    setResults([]);
    
    try {
      // Vérifier que les données requises sont présentes
      if (!formData.location || !formData.location.lat || !formData.location.lon) {
        throw new Error('Localisation incomplète. Veuillez sélectionner un lieu.');
      }

      // Préparer les données pour l'API
      const requestData = {
        location: {
          city: formData.location.city || '',
          postcode: formData.location.postcode || '',
          lat: formData.location.lat,
          lon: formData.location.lon,
          label: formData.location.label || ''
        },
        radius: formData.radius || 20,
        sector: formData.sector || ''
      };

      console.log('🔍 Envoi de la requête API:', requestData);

      // Appel API vers le backend avec timeout plus long pour l'enrichissement
      const response = await axios.post(
        `${API_BASE_URL}/api/companies/search`,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 300000 // 5 minutes pour permettre l'enrichissement
        }
      );

      console.log('✅ Réponse API reçue:', response.data);

      const companies = response.data.companies || [];
      
      console.log(`📊 ${companies.length} entreprises trouvées`);
      
      // Afficher les statistiques si disponibles
      if (response.data.stats) {
        console.log(`   - ${response.data.stats.withEmail} avec email`);
        console.log(`   - ${response.data.stats.withPhone} avec téléphone`);
        console.log(`   - ${response.data.stats.withBoth} avec email ET téléphone`);
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

  return { results, loading, error, performSearch };
};
