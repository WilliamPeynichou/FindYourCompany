import React, { useState, useEffect, useRef } from 'react';
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
      if (val.length < 3) return;
      setLoading(true);
      try {
        const response = await axios.get(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&addressdetails=1&limit=5&countrycodes=fr`
        );
        setSuggestions(response.data);
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
  }, [query]);

  const handleSelect = (item) => {
    const label = `${item.address.city || item.address.town || item.display_name} (${item.address.postcode || ''})`;
    onSelect({
      label,
      lat: item.lat,
      lon: item.lon,
      postcode: item.address.postcode,
      city: item.address.city || item.address.town
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
              {suggestions.map((item, idx) => (
                <li
                  key={idx}
                  onClick={() => handleSelect(item)}
                  className="px-6 py-3 hover:bg-zinc-50 cursor-pointer text-sm border-b border-zinc-50 last:border-b-0"
                >
                  <span className="font-medium text-zinc-900">{item.address.city || item.address.town || item.display_name}</span>
                  <span className="ml-2 text-zinc-400 text-xs">({item.address.postcode})</span>
                </li>
              ))}
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
