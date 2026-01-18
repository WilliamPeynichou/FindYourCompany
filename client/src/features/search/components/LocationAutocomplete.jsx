import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { MapPin, Loader2, X } from 'lucide-react';
import { cn } from '../../../utils/cn';

export const LocationAutocomplete = ({ value, onSelect, error }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async (val) => {
      if (val.length < 2) {
        setSuggestions([]);
        return;
      }
      
      setLoading(true);
      try {
        // Utiliser l'API Geo gouv.fr pour les communes françaises
        // Cette API retourne uniquement des communes avec codes postaux
        const response = await axios.get('https://geo.api.gouv.fr/communes', {
          params: {
            nom: val,
            fields: 'nom,code,codesPostaux,centre,departement,region,population',
            boost: 'population', // Privilégier les grandes villes
            limit: 15
          }
        });

        // Transformer les résultats pour avoir une entrée par code postal
        const results = [];
        
        for (const commune of response.data) {
          // Si la commune a plusieurs codes postaux, créer une entrée pour chacun
          if (commune.codesPostaux && commune.codesPostaux.length > 0) {
            for (const codePostal of commune.codesPostaux) {
              results.push({
                nom: commune.nom,
                codePostal: codePostal,
                codeCommune: commune.code,
                departement: commune.departement?.nom || '',
                codeDepartement: commune.departement?.code || '',
                region: commune.region?.nom || '',
                population: commune.population || 0,
                centre: commune.centre
              });
            }
          }
        }

        // Trier par population (grandes villes en premier) puis par code postal
        results.sort((a, b) => {
          if (b.population !== a.population) {
            return b.population - a.population;
          }
          return a.codePostal.localeCompare(b.codePostal);
        });

        // Limiter à 10 résultats
        setSuggestions(results.slice(0, 10));
        setIsOpen(true);
      } catch (err) {
        console.error('Erreur recherche communes:', err);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    if (query.length >= 2) {
      const timeoutId = setTimeout(() => fetchSuggestions(query), 250);
      return () => clearTimeout(timeoutId);
    } else {
      setSuggestions([]);
    }
  }, [query]);

  /**
   * Récupère les coordonnées GPS d'une commune via l'API Adresse
   */
  const getCoordinates = async (commune) => {
    try {
      // Utiliser le centre de la commune si disponible
      if (commune.centre && commune.centre.coordinates) {
        return {
          lon: commune.centre.coordinates[0],
          lat: commune.centre.coordinates[1]
        };
      }
      
      // Sinon, géocoder avec l'API Adresse
      const response = await axios.get('https://api-adresse.data.gouv.fr/search/', {
        params: {
          q: `${commune.nom} ${commune.codePostal}`,
          type: 'municipality',
          limit: 1
        }
      });

      if (response.data.features && response.data.features.length > 0) {
        const coords = response.data.features[0].geometry.coordinates;
        return { lon: coords[0], lat: coords[1] };
      }
      
      return null;
    } catch (error) {
      console.error('Erreur géocodage:', error);
      return null;
    }
  };

  const handleSelect = async (commune) => {
    setLoading(true);
    
    // Récupérer les coordonnées
    const coords = await getCoordinates(commune);
    
    if (!coords) {
      console.error('Impossible de récupérer les coordonnées');
      setLoading(false);
      return;
    }

    // Construire le label
    const label = `${commune.nom} (${commune.codePostal})`;
    
    onSelect({
      label,
      lat: coords.lat.toString(),
      lon: coords.lon.toString(),
      postcode: commune.codePostal,
      city: commune.nom,
      codeCommune: commune.codeCommune,
      departement: commune.departement,
      codeDepartement: commune.codeDepartement
    });
    
    setQuery('');
    setIsOpen(false);
    setLoading(false);
  };

  /**
   * Formatte la population pour l'affichage
   */
  const formatPopulation = (pop) => {
    if (!pop) return '';
    if (pop >= 1000000) return `${(pop / 1000000).toFixed(1)}M hab.`;
    if (pop >= 1000) return `${(pop / 1000).toFixed(0)}k hab.`;
    return `${pop} hab.`;
  };

  return (
    <div className="w-full" ref={dropdownRef}>
      {/* Barre de recherche */}
      {!value && (
        <div className="relative">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-800" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une ville..."
            className={cn(
              "w-full pl-12 pr-10 py-3.5 rounded-full border border-zinc-300 focus:border-blue-500 focus:outline-none transition-all text-lg shadow-sm",
              error && "border-red-500"
            )}
          />
          {loading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 animate-spin" />}
          
          {isOpen && suggestions.length > 0 && (
            <ul className="absolute z-[1001] w-full mt-2 bg-white border border-zinc-200 rounded-2xl shadow-xl max-h-80 overflow-auto py-2">
              {suggestions.map((commune, idx) => (
                <li
                  key={`${commune.codeCommune}-${commune.codePostal}-${idx}`}
                  onClick={() => handleSelect(commune)}
                  className="px-5 py-3 hover:bg-blue-50 cursor-pointer border-b border-zinc-50 last:border-b-0 transition-colors"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-zinc-900 truncate">
                          {commune.nom}
                        </span>
                        <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md font-medium">
                          {commune.codePostal}
                        </span>
                      </div>
                      <span className="text-xs text-zinc-500 truncate">
                        {commune.departement}{commune.codeDepartement ? ` (${commune.codeDepartement})` : ''}
                      </span>
                    </div>
                    {commune.population > 0 && (
                      <span className="text-xs text-zinc-400 whitespace-nowrap">
                        {formatPopulation(commune.population)}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
          
          {isOpen && query.length >= 2 && suggestions.length === 0 && !loading && (
            <div className="absolute z-[1001] w-full mt-2 bg-white border border-zinc-200 rounded-2xl shadow-xl py-4 px-5 text-center text-zinc-500 text-sm">
              Aucune commune trouvée pour "{query}"
            </div>
          )}
        </div>
      )}

      {/* Chip de localisation sélectionnée */}
      {value && (
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-900 px-4 py-2 rounded-xl border border-blue-100 mb-4 animate-in fade-in zoom-in duration-300">
          <MapPin className="w-4 h-4" />
          <span className="text-sm font-medium">{value.label}</span>
          <button 
            onClick={() => onSelect(null)}
            className="hover:bg-blue-200 p-0.5 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      
      {error && <span className="text-xs text-red-500 mt-2 block ml-4">{error}</span>}
    </div>
  );
};
