import React, { useState, useMemo } from 'react';
import { Mail, MapPin, Phone, Globe, Building2, Users, Calendar, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { sanitizeUrl, sanitizeEmail, sanitizePhone } from '../../../utils/escapeHtml';
import { LegalFormFilter, LEGAL_CATEGORIES } from './LegalFormFilter';

const getLegalFormBadgeClass = (forme) => {
  if (!forme) return null;
  const f = forme.toLowerCase();
  if (f.includes('micro') || f.includes('auto-entrepreneur') || f.includes('auto entrepreneur')) {
    return 'bg-orange-50 text-orange-700 border border-orange-200';
  }
  if (
    (f.includes('individu') && !f.includes('micro') && !f.includes('auto')) ||
    f.includes('artisan') || f.includes('commerçant') ||
    ['1000', '1100', '1200', '1300'].includes(forme)
  ) {
    return 'bg-amber-50 text-amber-700 border border-amber-200';
  }
  if (
    f.includes('sarl') || f.includes('eurl') || f.includes('sas') || f.includes('sasu') ||
    f.includes('snc') || f.includes('société') || f === 'sa' || f.includes('anonyme') ||
    ['5410', '5420', '5498', '5499', '5710', '5720', '5800'].includes(forme)
  ) {
    return 'bg-blue-50 text-blue-700 border border-blue-200';
  }
  if (f.includes('association') || f.includes('fondation') || f.includes('syndicat')) {
    return 'bg-purple-50 text-purple-700 border border-purple-200';
  }
  return 'bg-zinc-100 text-zinc-600 border border-zinc-200';
};

export const ResultsList = ({ results, loading, stats, source, emptyTitle, emptyHint }) => {
  const [expandedCards, setExpandedCards] = useState({});
  const [selectedCategories, setSelectedCategories] = useState([]);

  const allResults = results || [];

  const filteredResults = useMemo(() => {
    if (selectedCategories.length === 0) return allResults;
    const activeCats = LEGAL_CATEGORIES.filter(c => selectedCategories.includes(c.id));
    return allResults.filter(company =>
      activeCats.some(cat => cat.match(company.formeJuridique))
    );
  }, [allResults, selectedCategories]);

  const toggleCard = (id) => {
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 bg-gradient-to-r from-zinc-50 to-zinc-100 border border-zinc-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!allResults || allResults.length === 0) {
    return (
      <div className="text-center py-16">
        <Building2 className="w-12 h-12 mx-auto text-zinc-300 mb-4" />
        <p className="text-zinc-500 text-sm">{emptyTitle || 'Aucune entreprise trouvée dans cette zone.'}</p>
        <p className="text-zinc-400 text-xs mt-2">{emptyHint || "Essayez d'élargir le rayon ou de changer de secteur."}</p>
      </div>
    );
  }

  const handleExportCSV = () => {
    const headers = ['Nom', 'SIREN', 'SIRET', 'Adresse', 'Ville', 'Code Postal', 'Secteur', 'Distance (km)', 'Email', 'Téléphone', 'Site Web'];
    const rows = filteredResults.map(c => [
      c.name || '',
      c.siren || '',
      c.siret || '',
      c.address || '',
      c.city || '',
      c.postcode || '',
      c.sectorLabel || c.sector || '',
      c.distance || '',
      c.email || '',
      c.phone || '',
      c.website || ''
    ]);

    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `entreprises_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-4">
      {/* En-tête avec stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-zinc-200">
        <div>
          <h2 className="text-xl font-bold text-zinc-900">
            {filteredResults.length}{selectedCategories.length > 0 ? ` / ${allResults.length}` : ''}{' '}
            {filteredResults.length === 1 ? 'entreprise trouvée' : 'entreprises trouvées'}
          </h2>
          {source && (
            <p className="text-xs text-zinc-500 mt-1">
              Source : {source}
            </p>
          )}
          {stats && (
            <div className="flex gap-4 mt-2 text-xs text-zinc-500">
              {stats.withCoordinates > 0 && (
                <span>📍 {stats.withCoordinates} géolocalisées</span>
              )}
              {stats.withDirigeants > 0 && (
                <span>👤 {stats.withDirigeants} avec dirigeants</span>
              )}
            </div>
          )}
        </div>
        <button
          onClick={handleExportCSV}
          className="text-xs border border-zinc-300 px-4 py-2 rounded-lg hover:bg-zinc-50 hover:border-zinc-400 transition-all flex items-center gap-2"
        >
          <ExternalLink className="w-3 h-3" />
          Exporter en CSV
        </button>
      </div>

      {/* Filtres par type d'entreprise */}
      <LegalFormFilter
        results={allResults}
        selected={selectedCategories}
        onChange={setSelectedCategories}
      />

      {/* Liste des entreprises */}
      <div className="space-y-3">
        {filteredResults.map((company, index) => {
          const cardId = company.siren || company.siret || index;
          const isExpanded = expandedCards[cardId];

          return (
            <div
              key={cardId}
              className="bg-white border border-zinc-200 rounded-lg hover:border-zinc-300 hover:shadow-sm transition-all overflow-hidden"
            >
              {/* En-tête de la carte */}
              <div className="p-5">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Badges secteur + forme juridique */}
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {(company.sectorLabel || company.sector) && (
                        <div className="inline-flex items-center gap-1.5 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md">
                          <Building2 className="w-3 h-3" />
                          {company.sectorLabel || company.sector}
                        </div>
                      )}
                      {company.formeJuridique && (
                        <div
                          className={`inline-flex items-center text-xs px-2 py-1 rounded-md ${getLegalFormBadgeClass(company.formeJuridique)}`}
                          title={company.formeJuridique}
                        >
                          {company.formeJuridique.length > 30
                            ? company.formeJuridique.slice(0, 28) + '…'
                            : company.formeJuridique}
                        </div>
                      )}
                    </div>

                    {/* Nom de l'entreprise */}
                    <h3 className="text-lg font-bold text-zinc-900 mb-2 truncate">
                      {company.name}
                    </h3>

                    {/* Adresse */}
                    <div className="flex items-start gap-2 text-sm text-zinc-600 mb-2">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-zinc-400" />
                      <span>{company.address}</span>
                    </div>

                    {/* Infos complémentaires */}
                    <div className="flex flex-wrap gap-3 text-xs text-zinc-500">
                      {company.siren && (
                        <span className="font-mono bg-zinc-100 px-2 py-0.5 rounded">
                          SIREN: {company.siren}
                        </span>
                      )}
                      {company.distance !== undefined && company.distance !== null && (
                        <span className="text-blue-600 font-medium">
                          📍 {company.distance} km
                        </span>
                      )}
                      {company.effectif && (
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {company.effectif}
                        </span>
                      )}
                      {company.dateCreation && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(company.dateCreation).toLocaleDateString('fr-FR')}
                        </span>
                      )}
                    </div>

                    {/* Contacts si disponibles */}
                    {(company.email || company.phone) && (
                      <div className="flex flex-wrap gap-4 text-sm text-zinc-700 mt-3 pt-3 border-t border-zinc-100">
                        {company.email && (
                          <a
                            href={`mailto:${sanitizeEmail(company.email)}`}
                            className="flex items-center gap-1.5 hover:text-blue-600 transition-colors"
                          >
                            <Mail className="w-4 h-4" />
                            {company.email}
                          </a>
                        )}
                        {company.phone && (
                          <a
                            href={`tel:${sanitizePhone(company.phone)}`}
                            className="flex items-center gap-1.5 hover:text-blue-600 transition-colors"
                          >
                            <Phone className="w-4 h-4" />
                            {company.phone}
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Boutons d'action */}
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {company.email && sanitizeEmail(company.email) && (
                      <a
                        href={`mailto:${sanitizeEmail(company.email)}`}
                        className="text-xs bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all text-center"
                      >
                        Contacter
                      </a>
                    )}
                    {company.website && sanitizeUrl(company.website) && (
                      <a
                        href={sanitizeUrl(company.website)}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-xs border border-zinc-300 px-4 py-2 rounded-lg hover:bg-zinc-50 transition-all flex items-center justify-center gap-1"
                      >
                        <Globe className="w-3 h-3" />
                        Site web
                      </a>
                    )}
                    {(company.dirigeants?.length > 0 || company.formeJuridique) && (
                      <button
                        onClick={() => toggleCard(cardId)}
                        className="text-xs text-zinc-500 hover:text-zinc-700 flex items-center justify-center gap-1 py-1"
                      >
                        {isExpanded ? (
                          <>Moins <ChevronUp className="w-3 h-3" /></>
                        ) : (
                          <>Plus <ChevronDown className="w-3 h-3" /></>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Détails expandables */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-0 border-t border-zinc-100 bg-zinc-50">
                  <div className="pt-4 space-y-3">
                    {company.formeJuridique && (
                      <div className="text-xs">
                        <span className="font-medium text-zinc-600">Forme juridique :</span>{' '}
                        <span className="text-zinc-800">{company.formeJuridique}</span>
                      </div>
                    )}
                    {company.siret && (
                      <div className="text-xs">
                        <span className="font-medium text-zinc-600">SIRET :</span>{' '}
                        <span className="font-mono text-zinc-800">{company.siret}</span>
                      </div>
                    )}
                    {company.dirigeants && company.dirigeants.length > 0 && (
                      <div className="text-xs">
                        <span className="font-medium text-zinc-600">Dirigeants :</span>
                        <ul className="mt-1 space-y-1">
                          {company.dirigeants.map((d, i) => (
                            <li key={i} className="text-zinc-800">
                              {d.prenoms} {d.nom} {d.qualite && <span className="text-zinc-500">({d.qualite})</span>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Note sur les données */}
      <div className="text-center py-4 text-xs text-zinc-400">
        Données issues des registres légaux français. Les informations de contact (email, téléphone)
        ne sont pas disponibles via l'API gratuite.
      </div>
    </div>
  );
};
