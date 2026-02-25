import { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const useAssociationSearch = () => {
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
      if (!formData.location) {
        throw new Error('Localisation incomplète. Veuillez sélectionner un lieu.');
      }

      if (!formData.location.postcode && !formData.location.city) {
        throw new Error('Ville ou code postal requis pour la recherche.');
      }

      const requestData = {
        location: {
          city: formData.location.city || '',
          postcode: formData.location.postcode || '',
          lat: formData.location.lat || '',
          lon: formData.location.lon || '',
          label: formData.location.label || ''
        },
        radius: formData.radius || 10,
        domain: formData.domain || ''
      };

      console.log('🔍 Envoi de la requête recherche associations:', requestData);

      const response = await axios.post(
        `${API_BASE_URL}/api/companies/search-associations`,
        requestData,
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 60000
        }
      );

      console.log('✅ Réponse associations reçue:', response.data);

      const companies = response.data.companies || [];

      if (response.data.stats) {
        setStats(response.data.stats);
      }

      if (response.data.source) {
        setSource(response.data.source);
      }

      setResults(companies);
      setLoading(false);

      if (companies.length === 0) {
        setError('Aucune association trouvée dans cette zone.');
      }
    } catch (err) {
      console.error('❌ Erreur recherche associations:', err);

      let errorMessage = "Une erreur est survenue lors de la recherche.";

      if (err.response) {
        errorMessage = err.response.data?.error || err.response.data?.message || `Erreur ${err.response.status}`;
      } else if (err.request) {
        errorMessage = "Impossible de contacter le serveur. Vérifiez que le backend est démarré.";
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setLoading(false);
      setResults([]);
    }
  };

  return { results, loading, error, stats, source, performSearch };
};
