import React from 'react';

const ASSOCIATION_DOMAINS = [
  { id: '',          label: 'Tous domaines'  },
  { id: 'sport',     label: 'Sport'          },
  { id: 'culture',   label: 'Culture / Arts' },
  { id: 'social',    label: 'Social'         },
  { id: 'sante',     label: 'Santé'          },
  { id: 'education', label: 'Éducation'      },
  { id: 'loisirs',   label: 'Loisirs'        },
];

export const AssociationDomainSelect = ({ value, onChange }) => {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-zinc-700">
        Domaine d'activité
      </label>
      <div className="flex flex-wrap gap-2">
        {ASSOCIATION_DOMAINS.map((domain) => {
          const isSelected = value === domain.id;
          return (
            <button
              key={domain.id}
              type="button"
              onClick={() => onChange(domain.id)}
              className={`
                inline-flex items-center px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium
                border transition-all
                ${isSelected
                  ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                  : 'bg-white text-zinc-600 border-zinc-200 hover:border-purple-300 hover:text-purple-700'
                }
              `}
            >
              {domain.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
