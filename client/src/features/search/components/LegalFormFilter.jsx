import React from 'react';
import { X } from 'lucide-react';
import { LEGAL_CATEGORIES } from './legalCategories';

export const LegalFormFilter = ({ results, selected, onChange }) => {
  const categoriesWithCount = LEGAL_CATEGORIES
    .map(cat => ({ ...cat, count: (results || []).filter(c => cat.match(c.formeJuridique)).length }))
    .filter(cat => cat.count > 0);

  if (categoriesWithCount.length <= 1) return null;

  const toggle = (id) => {
    if (selected.includes(id)) {
      onChange(selected.filter(s => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 py-3 px-1">
      <span className="text-xs text-zinc-500 font-medium shrink-0">Type :</span>
      {categoriesWithCount.map((cat) => {
        const isSelected = selected.includes(cat.id);
        return (
          <button
            key={cat.id}
            onClick={() => toggle(cat.id)}
            className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border transition-all ${isSelected ? cat.activeColors : cat.colors}`}
          >
            {cat.label}
            <span className={`font-mono ${isSelected ? 'opacity-80' : 'opacity-60'}`}>({cat.count})</span>
          </button>
        );
      })}
      {selected.length > 0 && (
        <button
          onClick={() => onChange([])}
          className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-600 px-1 py-1 transition-colors"
        >
          <X className="w-3 h-3" />
          Tout effacer
        </button>
      )}
    </div>
  );
};
