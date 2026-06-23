export const LEGAL_CATEGORIES = [
  {
    id: 'auto-entrepreneur',
    label: 'Auto-entrepreneur',
    match: (f) => {
      if (!f) return false;
      const fl = f.toLowerCase();
      return fl.includes('micro') || fl.includes('auto-entrepreneur') || fl.includes('auto entrepreneur');
    },
    colors: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100',
    activeColors: 'bg-orange-500 text-white border-orange-500',
  },
  {
    id: 'independant',
    label: 'Indépendant / EI',
    match: (f) => {
      if (!f) return false;
      const fl = f.toLowerCase();
      return ((fl.includes('individu') && !fl.includes('micro') && !fl.includes('auto')) || fl.includes('artisan') || fl.includes('commerçant') || ['1000', '1100', '1200', '1300'].includes(f));
    },
    colors: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
    activeColors: 'bg-amber-500 text-white border-amber-500',
  },
  {
    id: 'societe',
    label: 'Société (SARL / SAS…)',
    match: (f) => {
      if (!f) return false;
      const fl = f.toLowerCase();
      return (fl.includes('sarl') || fl.includes('eurl') || fl.includes('sas') || fl.includes('sasu') || fl.includes('snc') || fl.includes('société') || fl === 'sa' || fl.includes('anonyme') || fl.includes('civile') || ['5410', '5420', '5498', '5499', '5560', '5710', '5720', '5800', '6540'].includes(f));
    },
    colors: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
    activeColors: 'bg-blue-600 text-white border-blue-600',
  },
  {
    id: 'association',
    label: 'Association / Fondation',
    match: (f) => {
      if (!f) return false;
      const fl = f.toLowerCase();
      return (fl.includes('association') || fl.includes('fondation') || fl.includes('syndicat') || fl.includes('congrégation') || ['9110', '9210', '9220', '9230', '9260', '9270'].includes(f));
    },
    colors: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
    activeColors: 'bg-purple-600 text-white border-purple-600',
  },
];
