import { useState } from 'react';
import axios from 'axios';

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
    
    try {
      // Simulation d'un appel API vers le backend
      // En production, décommentez la ligne suivante :
      // const response = await axios.post('/api/companies/search', formData);
      // setResults(response.data);

      console.log("Données envoyées au back:", formData);

      // Simulation de données pour la démo
      setTimeout(() => {
        const mockResults = [
          {
            id: 1,
            name: "Tech Solutions Bordeaux",
            email: "contact@techsolutions.fr",
            address: "12 Rue des Innovations, 33000 Bordeaux",
            sector: "Informatique / Tech",
            phone: "05 56 00 00 00",
            website: "https://techsolutions.fr"
          },
          {
            id: 2,
            name: "BTP Aquitaine",
            email: "info@btp-aquitaine.com",
            address: "45 Avenue de la Marne, 33700 Mérignac",
            sector: "BTP / Construction",
            phone: "05 57 11 22 33"
          },
          {
            id: 3,
            name: "Green Energy Services",
            email: "jobs@greenenergy.fr",
            address: "2 Place de la Bourse, 33000 Bordeaux",
            sector: "Industrie",
            website: "https://greenenergy.fr"
          }
        ];
        setResults(mockResults);
        setLoading(false);
      }, 1000);

    } catch (err) {
      setError("Une erreur est survenue lors de la recherche.");
      setLoading(false);
    }
  };

  return { results, loading, error, performSearch };
};

