import { useState, useRef } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const useAssociationSearch = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [source, setSource] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [totalResults, setTotalResults] = useState(0);

  const lastFormData = useRef(null);
  const nextStartPage = useRef(null);

  const fetchAssociations = async (formData, startPage, append) => {
    try {
      if (!formData.location) throw new Error('Localisation incomplète. Veuillez sélectionner un lieu.');
      if (!formData.location.postcode && !formData.location.city) throw new Error('Ville ou code postal requis pour la recherche.');

      const requestData = {
        location: {
          city: formData.location.city || '',
          postcode: formData.location.postcode || '',
          lat: formData.location.lat || '',
          lon: formData.location.lon || '',
          label: formData.location.label || ''
        },
        radius: formData.radius || 10,
        domain: formData.domain || '',
        startPage
      };

      const response = await axios.post(
        `${API_BASE_URL}/api/companies/search-associations`,
        requestData,
        { headers: { 'Content-Type': 'application/json' }, timeout: 60000 }
      );

      const companies = response.data.companies || [];

      if (response.data.stats && !append) setStats(response.data.stats);
      if (response.data.source && !append) setSource(response.data.source);

      if (append) {
        setResults(prev => [...prev, ...companies]);
      } else {
        setResults(companies);
        if (companies.length === 0) setError('Aucune association trouvée dans cette zone.');
      }

      nextStartPage.current = response.data.nextStartPage || null;
      setHasMore(!!response.data.nextStartPage);
      setTotalResults(response.data.totalResults || 0);

    } catch (err) {
      let errorMessage = "Une erreur est survenue lors de la recherche.";
      if (err.response) {
        errorMessage = err.response.data?.error || err.response.data?.message || `Erreur ${err.response.status}`;
      } else if (err.request) {
        errorMessage = "Impossible de contacter le serveur. Vérifiez que le backend est démarré.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      if (!append) setResults([]);
    }
  };

  const performSearch = async (formData) => {
    setLoading(true);
    setError(null);
    setResults([]);
    setStats(null);
    setSource(null);
    setHasMore(false);
    setTotalResults(0);
    lastFormData.current = formData;
    nextStartPage.current = null;

    await fetchAssociations(formData, 1, false);
    setLoading(false);
  };

  const loadMore = async () => {
    if (!lastFormData.current || !nextStartPage.current || loadingMore) return;
    setLoadingMore(true);
    setError(null);
    await fetchAssociations(lastFormData.current, nextStartPage.current, true);
    setLoadingMore(false);
  };

  return { results, loading, loadingMore, error, stats, source, hasMore, totalResults, performSearch, loadMore };
};
