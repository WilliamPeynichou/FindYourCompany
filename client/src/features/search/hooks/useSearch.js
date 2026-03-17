import { useState, useRef } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const useSearch = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [source, setSource] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [totalResults, setTotalResults] = useState(0);

  const lastFormData = useRef(null);
  const lastNextPage = useRef(null);

  // Unique point d'entrée pour tout appel API — identique pour recherche initiale et "load more"
  const _doSearch = async ({ formData, startPage, append }) => {
    setError(null);

    const requestData = {
      location: {
        city: formData.location.city || '',
        postcode: formData.location.postcode || '',
        lat: formData.location.lat || '',
        lon: formData.location.lon || '',
        label: formData.location.label || ''
      },
      radius: formData.radius || 5,
      sector: formData.sector || '',
      startPage
    };

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/companies/search-gouv`,
        requestData,
        { headers: { 'Content-Type': 'application/json' }, timeout: 60000 }
      );

      const companies = response.data.companies || [];

      if (!append) {
        setResults(companies);
        setStats(response.data.stats || null);
        setSource(response.data.source || null);
        if (companies.length === 0) setError('Aucune entreprise trouvée dans cette zone.');
      } else {
        setResults(prev => [...prev, ...companies]);
      }

      lastNextPage.current = response.data.nextStartPage || null;
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
    lastFormData.current = formData;
    lastNextPage.current = null;
    setLoading(true);
    setResults([]);
    setStats(null);
    setSource(null);
    setHasMore(false);
    setTotalResults(0);

    await _doSearch({ formData, startPage: 1, append: false });
    setLoading(false);
  };

  // Même logique que performSearch, juste en append avec la page suivante
  const loadMore = async () => {
    if (!lastFormData.current || !lastNextPage.current) return;
    setLoadingMore(true);
    await _doSearch({ formData: lastFormData.current, startPage: lastNextPage.current, append: true });
    setLoadingMore(false);
  };

  return { results, loading, loadingMore, error, stats, source, hasMore, totalResults, performSearch, loadMore };
};
