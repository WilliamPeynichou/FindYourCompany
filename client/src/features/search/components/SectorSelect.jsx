import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Building2, X } from 'lucide-react';
import { cn } from '../../../utils/cn';

/**
 * Secteurs d'activité avec codes NAF correspondants
 * Structure optimisée pour l'API Recherche Entreprises (data.gouv.fr)
 */
const SECTORS = [
  {
    id: 'tech',
    label: 'Informatique / Tech',
    icon: '💻',
    nafCodes: ['62.01Z', '62.02A', '62.02B', '62.03Z', '62.09Z', '63.11Z', '63.12Z', '58.21Z', '58.29A', '58.29B', '58.29C'],
    description: 'Programmation, conseil IT, hébergement, édition de logiciels'
  },
  {
    id: 'btp',
    label: 'BTP / Construction',
    icon: '🏗️',
    nafCodes: ['41.20A', '41.20B', '43.11Z', '43.12A', '43.12B', '43.21A', '43.21B', '43.22A', '43.22B', '43.31Z', '43.32A', '43.32B', '43.33Z', '43.34Z', '43.39Z', '43.91A', '43.91B', '43.99A', '43.99B', '43.99C', '43.99D', '43.99E'],
    description: 'Construction, travaux, électricité, plomberie, maçonnerie'
  },
  {
    id: 'sante',
    label: 'Santé / Médical',
    icon: '🏥',
    nafCodes: ['86.10Z', '86.21Z', '86.22A', '86.22B', '86.22C', '86.23Z', '86.90A', '86.90B', '86.90C', '86.90D', '86.90E', '86.90F'],
    description: 'Médecins, dentistes, infirmiers, kinés, laboratoires'
  },
  {
    id: 'social',
    label: 'Action sociale',
    icon: '🤝',
    nafCodes: ['87.10A', '87.10B', '87.10C', '87.20A', '87.20B', '87.30A', '87.30B', '88.10A', '88.10B', '88.10C', '88.91A', '88.91B', '88.99A', '88.99B'],
    description: 'Hébergement social, aide à domicile, crèches, EHPAD'
  },
  {
    id: 'commerce',
    label: 'Commerce de détail',
    icon: '🛒',
    nafCodes: ['47.11A', '47.11B', '47.11C', '47.11D', '47.11E', '47.11F', '47.19A', '47.19B', '47.21Z', '47.22Z', '47.23Z', '47.24Z', '47.25Z', '47.26Z', '47.29Z', '47.30Z', '47.41Z', '47.42Z', '47.43Z', '47.51Z', '47.52A', '47.52B', '47.53Z', '47.54Z', '47.59A', '47.59B', '47.61Z', '47.62Z', '47.63Z', '47.64Z', '47.65Z', '47.71Z', '47.72A', '47.72B', '47.73Z', '47.74Z', '47.75Z', '47.76Z', '47.77Z', '47.78A', '47.78B', '47.78C', '47.79Z'],
    description: 'Magasins, boutiques, épiceries, supermarchés'
  },
  {
    id: 'commerce-gros',
    label: 'Commerce de gros',
    icon: '📦',
    nafCodes: ['46.11Z', '46.12A', '46.12B', '46.13Z', '46.14Z', '46.15Z', '46.16Z', '46.17A', '46.17B', '46.18Z', '46.19A', '46.19B', '46.21Z', '46.22Z', '46.23Z', '46.24Z', '46.31Z', '46.32A', '46.32B', '46.32C', '46.33Z', '46.34Z', '46.35Z', '46.36Z', '46.37Z', '46.38A', '46.38B', '46.39A', '46.39B'],
    description: 'Grossistes, centrales d\'achat, intermédiaires'
  },
  {
    id: 'restauration',
    label: 'Restauration',
    icon: '🍽️',
    nafCodes: ['56.10A', '56.10B', '56.10C', '56.21Z', '56.29A', '56.29B', '56.30Z'],
    description: 'Restaurants, cafés, bars, traiteurs, fast-food'
  },
  {
    id: 'hotellerie',
    label: 'Hôtellerie / Hébergement',
    icon: '🏨',
    nafCodes: ['55.10Z', '55.20Z', '55.30Z', '55.90Z'],
    description: 'Hôtels, campings, résidences de tourisme, gîtes'
  },
  {
    id: 'banque',
    label: 'Banque / Finance',
    icon: '🏦',
    nafCodes: ['64.11Z', '64.19Z', '64.20Z', '64.30Z', '64.91Z', '64.92Z', '64.99Z', '66.11Z', '66.12Z', '66.19A', '66.19B', '66.21Z', '66.22Z', '66.29Z', '66.30Z'],
    description: 'Banques, crédit, gestion d\'actifs, courtage'
  },
  {
    id: 'assurance',
    label: 'Assurance',
    icon: '🛡️',
    nafCodes: ['65.11Z', '65.12Z', '65.20Z', '65.30Z'],
    description: 'Assurances vie, non-vie, réassurance, caisses de retraite'
  },
  {
    id: 'industrie',
    label: 'Industrie manufacturière',
    icon: '🏭',
    nafCodes: ['25.11Z', '25.12Z', '25.21Z', '25.29Z', '25.30Z', '25.40Z', '25.50A', '25.50B', '25.61Z', '25.62A', '25.62B', '25.71Z', '25.72Z', '25.73A', '25.73B', '25.91Z', '25.92Z', '25.93Z', '25.94Z', '25.99A', '25.99B', '28.11Z', '28.12Z', '28.13Z', '28.14Z', '28.15Z', '28.21Z', '28.22Z', '28.23Z', '28.24Z', '28.25Z', '28.29A', '28.29B'],
    description: 'Fabrication, usinage, métallurgie, machines'
  },
  {
    id: 'agriculture',
    label: 'Agriculture / Élevage',
    icon: '🌾',
    nafCodes: ['01.11Z', '01.12Z', '01.13Z', '01.14Z', '01.15Z', '01.16Z', '01.19Z', '01.21Z', '01.22Z', '01.23Z', '01.24Z', '01.25Z', '01.26Z', '01.27Z', '01.28Z', '01.29Z', '01.30Z', '01.41Z', '01.42Z', '01.43Z', '01.44Z', '01.45Z', '01.46Z', '01.47Z', '01.49Z', '01.50Z', '01.61Z', '01.62Z', '01.63Z', '01.64Z', '01.70Z'],
    description: 'Cultures, élevage, viticulture, maraîchage'
  },
  {
    id: 'transport',
    label: 'Transport',
    icon: '🚚',
    nafCodes: ['49.10Z', '49.20Z', '49.31Z', '49.32Z', '49.39A', '49.39B', '49.39C', '49.41A', '49.41B', '49.41C', '49.42Z', '49.50Z', '50.10Z', '50.20Z', '50.30Z', '50.40Z', '51.10Z', '51.21Z'],
    description: 'Transport routier, ferroviaire, maritime, aérien'
  },
  {
    id: 'logistique',
    label: 'Logistique / Entreposage',
    icon: '📦',
    nafCodes: ['52.10A', '52.10B', '52.21Z', '52.22Z', '52.23Z', '52.24A', '52.24B', '52.29A', '52.29B'],
    description: 'Entreposage, manutention, gestion de fret'
  },
  {
    id: 'conseil',
    label: 'Conseil / Gestion',
    icon: '💼',
    nafCodes: ['70.10Z', '70.21Z', '70.22Z'],
    description: 'Conseil en management, stratégie, organisation'
  },
  {
    id: 'juridique',
    label: 'Activités juridiques',
    icon: '⚖️',
    nafCodes: ['69.10Z'],
    description: 'Avocats, notaires, huissiers, conseil juridique'
  },
  {
    id: 'comptabilite',
    label: 'Comptabilité / Audit',
    icon: '📊',
    nafCodes: ['69.20Z'],
    description: 'Experts-comptables, commissaires aux comptes, audit'
  },
  {
    id: 'immobilier',
    label: 'Immobilier',
    icon: '🏠',
    nafCodes: ['68.10Z', '68.20A', '68.20B', '68.31Z', '68.32A', '68.32B'],
    description: 'Agences immobilières, promotion, gestion locative'
  },
  {
    id: 'communication',
    label: 'Communication / Publicité',
    icon: '📢',
    nafCodes: ['73.11Z', '73.12Z', '73.20Z'],
    description: 'Agences de pub, relations publiques, études de marché'
  },
  {
    id: 'design',
    label: 'Design / Création',
    icon: '🎨',
    nafCodes: ['74.10Z', '74.20Z', '74.30Z'],
    description: 'Design, photographie, traduction'
  },
  {
    id: 'formation',
    label: 'Enseignement / Formation',
    icon: '🎓',
    nafCodes: ['85.10Z', '85.20Z', '85.31Z', '85.32Z', '85.41Z', '85.42Z', '85.51Z', '85.52Z', '85.53Z', '85.59A', '85.59B', '85.60Z'],
    description: 'Écoles, centres de formation, auto-écoles'
  },
  {
    id: 'beaute',
    label: 'Beauté / Bien-être',
    icon: '💅',
    nafCodes: ['96.02A', '96.02B', '96.04Z', '96.09Z'],
    description: 'Coiffure, esthétique, spa, instituts de beauté'
  },
  {
    id: 'sport',
    label: 'Sport / Loisirs',
    icon: '⚽',
    nafCodes: ['93.11Z', '93.12Z', '93.13Z', '93.19Z', '93.21Z', '93.29Z'],
    description: 'Clubs sportifs, salles de sport, parcs de loisirs'
  },
  {
    id: 'reparation',
    label: 'Réparation / Maintenance',
    icon: '🔧',
    nafCodes: ['33.11Z', '33.12Z', '33.13Z', '33.14Z', '33.15Z', '33.16Z', '33.17Z', '33.19Z', '33.20A', '33.20B', '33.20C', '33.20D', '45.20A', '45.20B', '95.11Z', '95.12Z', '95.21Z', '95.22Z', '95.23Z', '95.24Z', '95.25Z', '95.29Z'],
    description: 'Réparation auto, électroménager, informatique'
  },
  {
    id: 'nettoyage',
    label: 'Nettoyage / Propreté',
    icon: '🧹',
    nafCodes: ['81.21Z', '81.22Z', '81.29A', '81.29B'],
    description: 'Nettoyage de locaux, désinfection, dératisation'
  },
  {
    id: 'securite',
    label: 'Sécurité / Gardiennage',
    icon: '🔒',
    nafCodes: ['80.10Z', '80.20Z', '80.30Z'],
    description: 'Gardiennage, surveillance, enquêtes'
  }
];

export const SectorSelect = ({ value, onChange, error }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Fermer le dropdown au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus sur l'input de recherche à l'ouverture
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Filtrer les secteurs selon la recherche
  const filteredSectors = SECTORS.filter(sector => {
    const query = searchQuery.toLowerCase();
    return (
      sector.label.toLowerCase().includes(query) ||
      sector.description.toLowerCase().includes(query) ||
      sector.nafCodes.some(code => code.includes(query))
    );
  });

  // Trouver le secteur sélectionné
  const selectedSector = SECTORS.find(s => s.id === value);

  const handleSelect = (sector) => {
    onChange(sector.id);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
  };

  return (
    <div className="w-full flex flex-col gap-2 relative" ref={dropdownRef}>
      <label className="text-xs font-medium text-zinc-700">Secteur d'activité</label>
      
      {/* Bouton de sélection */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative w-full px-4 py-3 bg-zinc-50 border border-zinc-200 text-left transition-all flex items-center justify-between rounded-lg",
          "hover:border-zinc-300 focus:border-blue-500 focus:outline-none",
          isOpen && "border-blue-500 ring-2 ring-blue-100",
          error && "border-red-500"
        )}
      >
        {selectedSector ? (
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="text-xl">{selectedSector.icon}</span>
            <div className="flex flex-col min-w-0">
              <span className="font-medium text-zinc-900 truncate">{selectedSector.label}</span>
              <span className="text-xs text-zinc-500 truncate">{selectedSector.description}</span>
            </div>
          </div>
        ) : (
          <span className="text-zinc-500">Tous les secteurs d'activité</span>
        )}
        
        <div className="flex items-center gap-2 ml-2">
          {selectedSector && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:bg-zinc-200 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-zinc-500" />
            </button>
          )}
          <ChevronDown className={cn(
            "w-5 h-5 text-zinc-400 transition-transform",
            isOpen && "rotate-180"
          )} />
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-[1002] mt-1 w-full max-w-xl bg-white border border-zinc-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Barre de recherche */}
          <div className="p-3 border-b border-zinc-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un secteur ou code NAF..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-zinc-200 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Liste des secteurs */}
          <ul className="max-h-72 overflow-auto py-2">
            {/* Option "Tous les secteurs" */}
            <li
              onClick={() => { onChange(''); setIsOpen(false); setSearchQuery(''); }}
              className={cn(
                "px-4 py-3 cursor-pointer transition-colors flex items-center gap-3",
                !value ? "bg-blue-50" : "hover:bg-zinc-50"
              )}
            >
              <Building2 className="w-5 h-5 text-zinc-400" />
              <div className="flex flex-col">
                <span className="font-medium text-zinc-700">Tous les secteurs</span>
                <span className="text-xs text-zinc-500">Rechercher dans toutes les activités</span>
              </div>
            </li>

            <li className="border-t border-zinc-100 my-1" />

            {filteredSectors.length === 0 ? (
              <li className="px-4 py-6 text-center text-zinc-500 text-sm">
                Aucun secteur trouvé pour "{searchQuery}"
              </li>
            ) : (
              filteredSectors.map((sector) => (
                <li
                  key={sector.id}
                  onClick={() => handleSelect(sector)}
                  className={cn(
                    "px-4 py-3 cursor-pointer transition-colors",
                    value === sector.id ? "bg-blue-50" : "hover:bg-zinc-50"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl mt-0.5">{sector.icon}</span>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="font-medium text-zinc-900">{sector.label}</span>
                      <span className="text-xs text-zinc-500 mt-0.5">{sector.description}</span>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {sector.nafCodes.slice(0, 4).map(code => (
                          <span key={code} className="text-[10px] font-mono bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded">
                            {code}
                          </span>
                        ))}
                        {sector.nafCodes.length > 4 && (
                          <span className="text-[10px] text-zinc-400">
                            +{sector.nafCodes.length - 4} codes
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
      
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};

// Export des secteurs pour utilisation dans le backend
export { SECTORS };
