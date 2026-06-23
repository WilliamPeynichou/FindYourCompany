import React, { useState, useMemo } from 'react';
import { Mail, MapPin, Phone, Globe, Building2, Users, Calendar, ChevronDown, ChevronUp, ExternalLink, ChevronRight, BookmarkPlus, Check, Search, Copy, Star, Filter } from 'lucide-react';
import { sanitizeUrl, sanitizeEmail, sanitizePhone } from '../../../utils/escapeHtml';
import { LegalFormFilter } from './LegalFormFilter';
import { LEGAL_CATEGORIES } from './legalCategories';

const getLegalFormBadgeClass = (forme) => {
  if (!forme) return null;
  const f = forme.toLowerCase();
  if (f.includes('micro') || f.includes('auto-entrepreneur') || f.includes('auto entrepreneur')) return 'bg-orange-50 text-orange-700 border border-orange-200';
  if ((f.includes('individu') && !f.includes('micro') && !f.includes('auto')) || f.includes('artisan') || f.includes('commerçant') || ['1000', '1100', '1200', '1300'].includes(forme)) return 'bg-amber-50 text-amber-700 border border-amber-200';
  if (f.includes('sarl') || f.includes('eurl') || f.includes('sas') || f.includes('sasu') || f.includes('snc') || f.includes('société') || f === 'sa' || f.includes('anonyme') || ['5410', '5420', '5498', '5499', '5710', '5720', '5800'].includes(forme)) return 'bg-blue-50 text-blue-700 border border-blue-200';
  if (f.includes('association') || f.includes('fondation') || f.includes('syndicat')) return 'bg-purple-50 text-purple-700 border border-purple-200';
  return 'bg-zinc-100 text-zinc-600 border border-zinc-200';
};

const getCompanyId = (company, index) => company.siren || company.siret || `${company.name}-${index}`;

const buildApplicationMailto = (company) => {
  const email = sanitizeEmail(company.email);
  if (!email) return '#';
  const subject = `Candidature alternance - ${company.name}`;
  const body = `Bonjour,\n\nJe me permets de vous contacter car je recherche une alternance et votre entreprise ${company.name} correspond à mon projet professionnel.\n\nJe suis actuellement en formation et je souhaite rejoindre une structure dans laquelle je pourrai progresser, contribuer à des missions concrètes et développer mes compétences.\n\nJe serais ravi(e) de pouvoir vous transmettre mon CV et échanger avec vous sur une éventuelle opportunité en alternance, même dans le cadre d'une candidature spontanée.\n\nJe reste disponible pour un échange.\n\nCordialement,\n\n[Votre prénom et nom]\n[Votre téléphone]\n[Votre formation / rythme d'alternance]`;
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

const getPriority = (company) => {
  let score = 0;
  const labels = [];
  if (company.email) { score += 35; labels.push('Contact facile'); }
  if (company.website) { score += 20; labels.push('Site web disponible'); }
  if (company.phone) { score += 15; labels.push('Téléphone disponible'); }
  if (company.distance !== undefined && company.distance !== null && Number(company.distance) <= 20) { score += 15; labels.push('Proche de toi'); }
  if (company.etatAdministratif === 'A' || !company.etatAdministratif) { score += 10; labels.push('Entreprise active'); }
  if (company.effectif) { score += 5; labels.push(String(company.effectif).toLowerCase().includes('10 000') ? 'Grande structure' : 'Taille renseignée'); }

  if (!company.email) labels.push('Email non disponible');
  const title = score >= 65 ? 'À contacter en priorité' : score >= 40 ? 'Bonne piste' : 'À vérifier';
  return { score: Math.min(score, 100), title, labels: labels.slice(0, 4) };
};

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard?.writeText(text);
  } catch {
    // Copier est un confort, on ne bloque pas l'utilisateur.
  }
};

export const ResultsList = ({ results, loading, stats, source, emptyTitle, emptyHint, entitySingular, entityPlural, onLoadMore, loadingMore, hasMore, totalResults, alternanceMode = false, selection }) => {
  const [expandedCards, setExpandedCards] = useState({});
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [contactFilter, setContactFilter] = useState('all');

  const allResults = useMemo(() => results || [], [results]);

  const filteredResults = useMemo(() => {
    let next = allResults;
    if (selectedCategories.length > 0) {
      const activeCats = LEGAL_CATEGORIES.filter(c => selectedCategories.includes(c.id));
      next = next.filter(company => activeCats.some(cat => cat.match(company.formeJuridique)));
    }
    if (alternanceMode) {
      next = next.filter(company => {
        if (contactFilter === 'email') return !!company.email;
        if (contactFilter === 'website') return !!company.website;
        if (contactFilter === 'phone') return !!company.phone;
        if (contactFilter === 'close') return company.distance !== undefined && company.distance !== null && Number(company.distance) <= 20;
        if (contactFilter === 'active') return company.etatAdministratif === 'A' || !company.etatAdministratif;
        return true;
      });
      next = [...next].sort((a, b) => getPriority(b).score - getPriority(a).score);
    }
    return next;
  }, [allResults, selectedCategories, contactFilter, alternanceMode]);

  const toggleCard = (id) => setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));

  if (loading) {
    return <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-32 bg-gradient-to-r from-zinc-50 to-zinc-100 border border-zinc-200 rounded-lg animate-pulse" />)}</div>;
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
    const headers = alternanceMode
      ? ['Priorité', 'Nom', 'SIREN', 'SIRET', 'Adresse', 'Ville', 'Code Postal', 'Secteur', 'Distance (km)', 'Email', 'Téléphone', 'Site Web', 'Action recommandée']
      : ['Nom', 'SIREN', 'SIRET', 'Adresse', 'Ville', 'Code Postal', 'Secteur', 'Distance (km)', 'Email', 'Téléphone', 'Site Web'];
    const rows = filteredResults.map(c => {
      const priority = getPriority(c);
      const base = [c.name || '', c.siren || '', c.siret || '', c.address || '', c.city || '', c.postcode || '', c.sectorLabel || c.sector || '', c.distance || '', c.email || '', c.phone || '', c.website || ''];
      return alternanceMode ? [priority.title, ...base, c.email ? 'Postuler par email' : c.website ? 'Visiter le site / page recrutement' : c.phone ? 'Appeler' : 'Rechercher le contact'] : base;
    });
    const csvContent = [headers.join(';'), ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';'))].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${alternanceMode ? 'prospection_alternance' : 'entreprises'}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-zinc-200">
        <div>
          <h2 className="text-xl font-bold text-zinc-900">
            {filteredResults.length}{selectedCategories.length > 0 || contactFilter !== 'all' ? ` / ${allResults.length}` : ''}{' '}
            {filteredResults.length === 1 ? (entitySingular || 'entreprise trouvée') : (entityPlural || 'entreprises trouvées')}
            {totalResults > allResults.length && <span className="text-sm font-normal text-zinc-400 ml-2">sur {totalResults} disponibles</span>}
          </h2>
          {alternanceMode && <p className="text-xs text-zinc-500 mt-1">Ces entreprises correspondent à ta zone et ton secteur. Vérifie leurs offres ou contacte-les pour une candidature spontanée.</p>}
          {source && <p className="text-xs text-zinc-500 mt-1">Source : {source}</p>}
          {stats && (
            <div className="flex flex-wrap gap-4 mt-2 text-xs text-zinc-500">
              {stats.withCoordinates > 0 && <span>📍 {stats.withCoordinates} géolocalisées</span>}
              {stats.withDirigeants > 0 && <span>👤 {stats.withDirigeants} avec dirigeants</span>}
            </div>
          )}
        </div>
        <button onClick={handleExportCSV} className="text-xs border border-zinc-300 px-4 py-2 rounded-lg hover:bg-zinc-50 hover:border-zinc-400 transition-all flex items-center gap-2">
          <ExternalLink className="w-3 h-3" /> {alternanceMode ? 'Exporter prospection' : 'Exporter en CSV'}
        </button>
      </div>

      {alternanceMode && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-sm font-bold text-red-900 mb-3"><Filter className="w-4 h-4" /> Filtres utiles pour candidater</div>
          <div className="flex flex-wrap gap-2">
            {[
              ['all', 'Toutes'], ['email', 'Avec email'], ['website', 'Avec site web'], ['phone', 'Avec téléphone'], ['close', 'À moins de 20 km'], ['active', 'Actives']
            ].map(([value, label]) => (
              <button key={value} onClick={() => setContactFilter(value)} className={contactFilter === value ? 'text-xs bg-red-600 text-white px-3 py-1.5 rounded-full' : 'text-xs bg-white border border-red-100 text-red-700 px-3 py-1.5 rounded-full hover:border-red-300'}>
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      <LegalFormFilter results={allResults} selected={selectedCategories} onChange={setSelectedCategories} />

      <div className="space-y-3">
        {filteredResults.map((company, index) => {
          const cardId = getCompanyId(company, index);
          const isExpanded = expandedCards[cardId];
          const priority = getPriority(company);
          const googleQuery = `${company.name || ''} ${company.city || company.postcode || ''} recrutement alternance contact`;
          const selected = selection?.isSelected?.(company);

          return (
            <div key={cardId} className="bg-white border border-zinc-200 rounded-lg hover:border-zinc-300 hover:shadow-sm transition-all overflow-hidden">
              <div className="p-5">
                {alternanceMode && (
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className={priority.score >= 65 ? 'inline-flex items-center gap-1 text-xs bg-red-600 text-white px-2 py-1 rounded-md' : 'inline-flex items-center gap-1 text-xs bg-zinc-900 text-white px-2 py-1 rounded-md'}>
                      <Star className="w-3 h-3" /> {priority.title} · {priority.score}/100
                    </span>
                    {priority.labels.map(label => <span key={label} className="text-[11px] bg-zinc-100 text-zinc-600 px-2 py-1 rounded-md">{label}</span>)}
                  </div>
                )}

                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {(company.sectorLabel || company.sector) && <div className="inline-flex items-center gap-1.5 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md"><Building2 className="w-3 h-3" />{company.sectorLabel || company.sector}</div>}
                      {company.formeJuridique && <div className={`inline-flex items-center text-xs px-2 py-1 rounded-md ${getLegalFormBadgeClass(company.formeJuridique)}`} title={company.formeJuridique}>{company.formeJuridique.length > 30 ? company.formeJuridique.slice(0, 28) + '…' : company.formeJuridique}</div>}
                    </div>

                    <h3 className="text-lg font-bold text-zinc-900 mb-2 truncate">{company.name}</h3>
                    <div className="flex items-start gap-2 text-sm text-zinc-600 mb-2"><MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-zinc-400" /><span>{company.address}</span></div>

                    <div className="flex flex-wrap gap-3 text-xs text-zinc-500">
                      {company.siren && <span className="font-mono bg-zinc-100 px-2 py-0.5 rounded">SIREN: {company.siren}</span>}
                      {company.distance !== undefined && company.distance !== null && <span className="text-blue-600 font-medium">📍 {company.distance} km</span>}
                      {company.effectif && <span className="flex items-center gap-1"><Users className="w-3 h-3" />{company.effectif}</span>}
                      {company.dateCreation && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(company.dateCreation).toLocaleDateString('fr-FR')}</span>}
                    </div>

                    {(company.email || company.phone || alternanceMode) && (
                      <div className="flex flex-wrap gap-4 text-sm text-zinc-700 mt-3 pt-3 border-t border-zinc-100">
                        {company.email ? <a href={`mailto:${sanitizeEmail(company.email)}`} className="flex items-center gap-1.5 hover:text-blue-600 transition-colors"><Mail className="w-4 h-4" />{company.email}</a> : alternanceMode && <span className="flex items-center gap-1.5 text-zinc-400"><Mail className="w-4 h-4" />Email non disponible via les données publiques</span>}
                        {company.phone && <a href={`tel:${sanitizePhone(company.phone)}`} className="flex items-center gap-1.5 hover:text-blue-600 transition-colors"><Phone className="w-4 h-4" />{company.phone}</a>}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 flex-shrink-0 md:w-44">
                    {alternanceMode && selection && (
                      <button onClick={() => selection.addCompany(company)} disabled={selected} className={selected ? 'text-xs bg-green-50 text-green-700 border border-green-200 px-4 py-2 rounded-lg flex items-center justify-center gap-1' : 'text-xs border border-zinc-300 px-4 py-2 rounded-lg hover:bg-zinc-50 flex items-center justify-center gap-1'}>
                        {selected ? <><Check className="w-3 h-3" /> Dans ma sélection</> : <><BookmarkPlus className="w-3 h-3" /> Ajouter</>}
                      </button>
                    )}
                    {company.email && sanitizeEmail(company.email) && (
                      <a href={alternanceMode ? buildApplicationMailto(company) : `mailto:${sanitizeEmail(company.email)}`} className="text-xs bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all text-center">
                        {alternanceMode ? 'Postuler' : 'Contacter'}
                      </a>
                    )}
                    {company.website && sanitizeUrl(company.website) && (
                      <a href={sanitizeUrl(company.website)} target="_blank" rel="noreferrer noopener" className="text-xs border border-zinc-300 px-4 py-2 rounded-lg hover:bg-zinc-50 transition-all flex items-center justify-center gap-1"><Globe className="w-3 h-3" />{alternanceMode ? 'Site / recrutement' : 'Site web'}</a>
                    )}
                    {alternanceMode && !company.email && (
                      <>
                        <a href={`https://www.google.com/search?q=${encodeURIComponent(googleQuery)}`} target="_blank" rel="noreferrer noopener" className="text-xs border border-zinc-300 px-4 py-2 rounded-lg hover:bg-zinc-50 transition-all flex items-center justify-center gap-1"><Search className="w-3 h-3" />Chercher contact</a>
                        <button onClick={() => copyToClipboard(googleQuery)} className="text-xs text-zinc-600 hover:text-zinc-900 flex items-center justify-center gap-1 py-1"><Copy className="w-3 h-3" />Copier recherche</button>
                      </>
                    )}
                    {(company.dirigeants?.length > 0 || company.formeJuridique) && (
                      <button onClick={() => toggleCard(cardId)} className="text-xs text-zinc-500 hover:text-zinc-700 flex items-center justify-center gap-1 py-1">{isExpanded ? <>Moins <ChevronUp className="w-3 h-3" /></> : <>Plus <ChevronDown className="w-3 h-3" /></>}</button>
                    )}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="px-5 pb-5 pt-0 border-t border-zinc-100 bg-zinc-50">
                  <div className="pt-4 space-y-3">
                    {company.formeJuridique && <div className="text-xs"><span className="font-medium text-zinc-600">Forme juridique :</span> <span className="text-zinc-800">{company.formeJuridique}</span></div>}
                    {company.siret && <div className="text-xs"><span className="font-medium text-zinc-600">SIRET :</span> <span className="font-mono text-zinc-800">{company.siret}</span></div>}
                    {company.dirigeants && company.dirigeants.length > 0 && <div className="text-xs"><span className="font-medium text-zinc-600">Dirigeants :</span><ul className="mt-1 space-y-1">{company.dirigeants.map((d, i) => <li key={i} className="text-zinc-800">{d.prenoms} {d.nom} {d.qualite && <span className="text-zinc-500">({d.qualite})</span>}</li>)}</ul></div>}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {hasMore && onLoadMore && (
        <div className="flex flex-col items-center gap-2 pt-2 pb-2">
          <button onClick={onLoadMore} disabled={loadingMore} className="flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white text-sm font-semibold rounded-xl hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
            {loadingMore ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Chargement…</> : <>Charger plus d'entreprises<ChevronRight className="w-4 h-4" /></>}
          </button>
          {totalResults > allResults.length && <span className="text-xs text-zinc-400">{allResults.length} affichées sur {totalResults} disponibles</span>}
        </div>
      )}

      <div className="text-center py-4 text-xs text-zinc-400">
        Données issues des registres légaux français. {alternanceMode ? 'Le score aide à prioriser, il ne garantit pas que l’entreprise recrute.' : 'Les informations de contact (email, téléphone) ne sont pas disponibles via l’API gratuite.'}
      </div>
    </div>
  );
};
