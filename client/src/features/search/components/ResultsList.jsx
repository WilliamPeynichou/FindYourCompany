import React from 'react';
import { Mail, MapPin, Building2, Globe } from 'lucide-react';

export const ResultsList = ({ results, loading }) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-zinc-50 border border-zinc-200 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="text-center py-16 text-zinc-400 text-sm">
        Aucun résultat. Remplissez le formulaire pour lancer une recherche.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-200">
        <h2 className="text-lg font-bold">
          {results.length} {results.length === 1 ? 'entreprise trouvée' : 'entreprises trouvées'}
        </h2>
        <button className="text-xs text-zinc-500 hover:text-black">Exporter en CSV</button>
      </div>
      
      <div className="space-y-2">
        {results.map((company) => (
          <div key={company.id} className="bg-white p-6 border border-zinc-200 hover:border-black transition-all">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <div className="text-xs text-zinc-400 mb-1">{company.sector}</div>
                <h3 className="text-xl font-bold mb-2">{company.name}</h3>
                <div className="flex items-center gap-1 text-sm text-zinc-500">
                  <MapPin className="w-3 h-3" />
                  {company.address}
                </div>
              </div>

              <div className="flex gap-2">
                <a 
                  href={`mailto:${company.email}`} 
                  className="text-xs border border-black px-4 py-2 hover:bg-black hover:text-white transition-all"
                >
                  Email
                </a>
                {company.website && (
                  <a 
                    href={company.website} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-xs border border-black px-4 py-2 hover:bg-black hover:text-white transition-all"
                  >
                    Site web
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
