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

  /**
   * Extrait l'arrondissement du code postal ou du nom
   * Paris: 75001-75020 = 1er-20e arrondissement
   * Lyon: 69001-69009 = 1er-9e arrondissement
   * Marseille: 13001-13016 = 1er-16e arrondissement
   */
  const extractArrondissement = useCallback((postcode, suburb, city) => {
    if (!postcode || postcode.length !== 5) return null;
    
    const code = parseInt(postcode);
    
    // Paris (75001-75020)
    if (city === 'Paris' && code >= 75001 && code <= 75020) {
      const arrNum = code - 75000;
      if (arrNum === 1) return '1er Arrondissement';
      return `${arrNum}e Arrondissement`;
    }
    
    // Lyon (69001-69009)
    if (city === 'Lyon' && code >= 69001 && code <= 69009) {
      const arrNum = code - 69000;
      if (arrNum === 1) return '1er Arrondissement';
      return `${arrNum}e Arrondissement`;
    }
    
    // Marseille (13001-13016)
    if (city === 'Marseille' && code >= 13001 && code <= 13016) {
      const arrNum = code - 13000;
      if (arrNum === 1) return '1er Arrondissement';
      return `${arrNum}e Arrondissement`;
    }
    
    // Si le suburb contient déjà "Arrondissement", l'utiliser
    if (suburb && suburb.includes('Arrondissement')) {
      return suburb;
    }
    
    return null;
  }, []);

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
      if (val.length < 3) return;
      setLoading(true);
      try {
        const normalizedQuery = val.toLowerCase().trim();
        const isParis = normalizedQuery.includes('paris') && !normalizedQuery.match(/paris\s+\d/);
        const isLyon = normalizedQuery.includes('lyon') && !normalizedQuery.match(/lyon\s+\d/);
        const isMarseille = normalizedQuery.includes('marseille') && !normalizedQuery.match(/marseille\s+\d/);
        
        // Si on cherche Paris, Lyon ou Marseille sans numéro, chercher aussi les arrondissements
        let searchQueries = [val];
        if (isParis) {
          searchQueries.push('Paris 75001', 'Paris 75008', 'Paris 75016');
        } else if (isLyon) {
          searchQueries.push('Lyon 69001', 'Lyon 69002', 'Lyon 69003');
        } else if (isMarseille) {
          searchQueries.push('Marseille 13001', 'Marseille 13008', 'Marseille 13016');
        }
        
        // Faire les recherches en parallèle
        const allPromises = searchQueries.map(query => 
          axios.get(
            `https://nominatim.openstreetmap.org/search`,
            {
              params: {
                format: 'json',
                q: query,
                addressdetails: 1,
                limit: isParis || isLyon || isMarseille ? 3 : 8,
                countrycodes: 'fr',
                extratags: 1,
                namedetails: 1
              },
              headers: {
                'User-Agent': 'TrouveTaBoite/1.0'
              }
            }
          )
        );
        
        const responses = await Promise.all(allPromises);
        
        // Fusionner tous les résultats
        let allResults = [];
        responses.forEach(response => {
          allResults = allResults.concat(response.data);
        });
        
        // Dédupliquer par place_id
        const uniqueResults = Array.from(
          new Map(allResults.map(item => [item.place_id, item])).values()
        );
        
        // Filtrer et trier les résultats pour privilégier ceux avec codes postaux
        const sortedSuggestions = uniqueResults
          .filter(item => {
            const city = item.address?.city || item.address?.town || '';
            // Pour Paris/Lyon/Marseille, privilégier les arrondissements
            if ((isParis && city === 'Paris') || (isLyon && city === 'Lyon') || (isMarseille && city === 'Marseille')) {
              const postcode = item.address?.postcode || '';
              const arrondissement = extractArrondissement(postcode, item.address?.suburb || '', city);
              return arrondissement !== null || postcode.length === 5;
            }
            return true;
          })
          .sort((a, b) => {
            const aHasPostcode = a.address?.postcode ? 1 : 0;
            const bHasPostcode = b.address?.postcode ? 1 : 0;
            const aHasArr = extractArrondissement(a.address?.postcode || '', a.address?.suburb || '', a.address?.city || '') ? 1 : 0;
            const bHasArr = extractArrondissement(b.address?.postcode || '', b.address?.suburb || '', b.address?.city || '') ? 1 : 0;
            return (bHasPostcode + bHasArr) - (aHasPostcode + aHasArr);
          })
          .slice(0, 8); // Limiter à 8 résultats finaux
        
        setSuggestions(sortedSuggestions);
        setIsOpen(true);
      } catch (err) {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    if (query.length >= 3) {
      const timeoutId = setTimeout(() => fetchSuggestions(query), 300);
      return () => clearTimeout(timeoutId);
    }
  }, [query, extractArrondissement]);

  const handleSelect = (item) => {
    const city = item.address.city || item.address.town || item.address.municipality || '';
    const postcode = item.address.postcode || '';
    const suburb = item.address.suburb || item.address.city_district || '';
    
    // Extraire l'arrondissement du code postal ou du suburb
    const arrondissement = extractArrondissement(postcode, suburb, city);
    
    // Construire le label avec ville, arrondissement (si présent) et code postal
    let labelParts = [city];
    
    // Ajouter l'arrondissement si présent
    if (arrondissement) {
      // Formater l'arrondissement de manière plus courte pour le label
      const arrShort = arrondissement.replace(' Arrondissement', '');
      labelParts.push(arrShort);
    }
    
    // Ajouter le code postal
    if (postcode) {
      labelParts.push(`(${postcode})`);
    }
    
    const label = labelParts.join(' ');
    
    onSelect({
      label,
      lat: item.lat,
      lon: item.lon,
      postcode: postcode,
      city: city,
      suburb: arrondissement || suburb || null
    });
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div className="w-full" ref={dropdownRef}>
      {/* Barre de recherche style image */}
      {!value && (
        <div className="relative">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-800" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ajouter une localisation"
            className={cn(
              "w-full pl-12 pr-10 py-3.5 rounded-full border border-zinc-300 focus:border-blue-500 focus:outline-none transition-all text-lg shadow-sm",
              error && "border-red-500"
            )}
          />
          {loading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 animate-spin" />}
          
          {isOpen && suggestions.length > 0 && (
            <ul className="absolute z-[1001] w-full mt-2 bg-white border border-zinc-200 rounded-2xl shadow-xl max-h-60 overflow-auto py-2">
              {suggestions.map((item, idx) => {
                const city = item.address.city || item.address.town || item.address.municipality || item.display_name;
                const postcode = item.address.postcode || '';
                const suburb = item.address.suburb || item.address.city_district || '';
                
                // Extraire l'arrondissement pour l'affichage
                const arrondissement = extractArrondissement(postcode, suburb, city);
                const isParisLyonMarseille = city === 'Paris' || city === 'Lyon' || city === 'Marseille';
                
                return (
                  <li
                    key={idx}
                    onClick={() => handleSelect(item)}
                    className="px-6 py-3 hover:bg-zinc-50 cursor-pointer text-sm border-b border-zinc-50 last:border-b-0"
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-zinc-900">{city}</span>
                        {isParisLyonMarseille && arrondissement && (
                          <span className="text-zinc-600 text-xs font-semibold bg-blue-50 px-2 py-0.5 rounded">
                            {arrondissement.replace(' Arrondissement', '')}
                          </span>
                        )}
                        {postcode && (
                          <span className="ml-auto text-zinc-500 text-xs font-mono bg-zinc-100 px-2 py-0.5 rounded">
                            {postcode}
                          </span>
                        )}
                      </div>
                      {item.address.state && (
                        <span className="text-zinc-400 text-xs mt-0.5">{item.address.state}</span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {/* Chip de localisation sélectionnée */}
      {value && (
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-900 px-4 py-2 rounded-xl border border-blue-100 mb-4 animate-in fade-in zoom-in duration-300">
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
