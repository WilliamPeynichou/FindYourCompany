import React from 'react';
import { cn } from '../../../utils/cn';

const SECTORS = [
  "Informatique / Tech",
  "BTP / Construction",
  "Santé / Social",
  "Commerce / Vente",
  "Restauration / Hôtellerie",
  "Banque / Assurance",
  "Industrie",
  "Agriculture",
  "Transport / Logistique",
  "Services aux entreprises"
];

export const SectorSelect = ({ value, onChange, error }) => {
  return (
    <div className="w-full flex flex-col gap-2">
      <label className="text-xs font-medium text-zinc-700">Secteur d'activité</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "px-3 py-2.5 bg-zinc-50 border border-zinc-200 focus:border-black focus:outline-none transition-all text-sm",
          error && "border-red-500"
        )}
      >
        <option value="">Tous les secteurs</option>
        {SECTORS.map(s => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};
