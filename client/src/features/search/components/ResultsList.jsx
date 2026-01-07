import React from 'react';
import { Mail, MapPin, Phone, Globe } from 'lucide-react';
import { escapeHtml, sanitizeUrl, sanitizeEmail, sanitizePhone } from '../../../utils/escapeHtml';

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

  const filteredResults = results || [];

  if (!filteredResults || filteredResults.length === 0) {
    return (
      <div className="text-center py-16 text-zinc-400 text-sm">
        Aucune entreprise trouvée.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-200">
        <h2 className="text-lg font-bold">
          {filteredResults.length} {filteredResults.length === 1 ? 'entreprise trouvée' : 'entreprises trouvées'}
        </h2>
        <button className="text-xs text-zinc-500 hover:text-black">Exporter en CSV</button>
      </div>
      
      <div className="space-y-2">
        {filteredResults.map((company, index) => (
          <div key={company.id || company.siret || index} className="bg-white p-6 border border-zinc-200 hover:border-black transition-all">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                {company.sector && (
                  <div className="text-xs text-zinc-400 mb-1">{escapeHtml(company.sector)}</div>
                )}
                <h3 className="text-xl font-bold mb-2">{escapeHtml(company.name)}</h3>
                <div className="flex items-center gap-1 text-sm text-zinc-500 mb-2">
                  <MapPin className="w-3 h-3" />
                  {escapeHtml(company.address)}
                </div>
                
                {/* Afficher les coordonnées disponibles (si présentes) */}
                {(company.email || company.phone) && (
                  <div className="flex flex-wrap gap-3 text-xs text-zinc-600">
                    {company.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        <span>{escapeHtml(company.email)}</span>
                      </div>
                    )}
                    {company.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        <span>{escapeHtml(company.phone)}</span>
                      </div>
                    )}
                  </div>
                )}
                {!company.email && !company.phone && (
                  <div className="text-xs text-zinc-400 italic">
                    Coordonnées non disponibles dans Sirene
                  </div>
                )}
              </div>

              <div className="flex gap-2 flex-wrap">
                {company.email && sanitizeEmail(company.email) && (
                  <a 
                    href={`mailto:${sanitizeEmail(company.email)}`} 
                    className="text-xs border border-black px-4 py-2 hover:bg-black hover:text-white transition-all"
                  >
                    Email
                  </a>
                )}
                {company.phone && sanitizePhone(company.phone) && (
                  <a 
                    href={`tel:${sanitizePhone(company.phone)}`} 
                    className="text-xs border border-black px-4 py-2 hover:bg-black hover:text-white transition-all"
                  >
                    Téléphone
                  </a>
                )}
                {company.website && sanitizeUrl(company.website) && (
                  <a 
                    href={sanitizeUrl(company.website)} 
                    target="_blank" 
                    rel="noreferrer noopener" 
                    className="text-xs border border-black px-4 py-2 hover:bg-black hover:text-white transition-all"
                  >
                    Site web
                  </a>
                )}
                {!company.email && !company.phone && !company.website && (
                  <span className="text-xs text-zinc-400 px-4 py-2">
                    Pas de contact disponible
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
