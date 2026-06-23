import React, { useState } from 'react';
import { Search, GraduationCap, FileText, HelpCircle } from 'lucide-react';
import { SearchForm } from './features/search/components/SearchForm';
import { ResultsList } from './features/search/components/ResultsList';
import { useSearch } from './features/search/hooks/useSearch';
import { AdBanner } from './components/AdSense';
import AssociationSearch from './features/associations/components/AssociationSearch';
import { ApplicationSelectionPanel } from './features/applications/ApplicationSelection';
import { useApplicationSelection } from './features/applications/useApplicationSelection';
import { SkillsCVPage } from './features/skills/SkillsCVPage';
import { AlternanceGuidePage } from './features/guide/AlternanceGuidePage';

function App() {
  const { results, loading, loadingMore, error, stats, source, hasMore, totalResults, performSearch, loadMore } = useSearch();
  const [mode, setMode] = useState('alternance');
  const selection = useApplicationSelection();

  const isSearchMode = mode === 'entreprises' || mode === 'alternance';
  const isAlternance = mode === 'alternance';

  const navButtonClass = (target) => mode === target
    ? 'bg-white shadow px-3 sm:px-5 py-1.5 rounded-full text-xs sm:text-sm font-semibold'
    : 'px-3 sm:px-5 py-1.5 text-xs sm:text-sm text-zinc-500 hover:text-zinc-700';

  return (
    <div className="min-h-screen nothing-bg font-sans text-black">
      <nav className="border-b border-zinc-200 py-4 px-8 bg-white sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button onClick={() => setMode('alternance')} className="nothing-dot-font text-lg font-black tracking-tighter text-left">
            TROUVETABOITE<span className="text-red-600">.</span>
          </button>
          <div className="flex flex-wrap gap-1 bg-zinc-100 p-1 rounded-full w-fit">
            <button onClick={() => setMode('alternance')} className={navButtonClass('alternance')}>Alternance</button>
            <button onClick={() => setMode('skills')} className={navButtonClass('skills')}>Skills & CV</button>
            <button onClick={() => setMode('guide')} className={navButtonClass('guide')}>Guide</button>
            <button onClick={() => setMode('entreprises')} className={navButtonClass('entreprises')}>Entreprises</button>
            <button onClick={() => setMode('associations')} className={navButtonClass('associations')}>Associations</button>
          </div>
        </div>
      </nav>

      <header className="pt-16 pb-12 px-8 max-w-6xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase mb-5">
          {isAlternance ? <GraduationCap className="w-3 h-3" /> : mode === 'skills' ? <FileText className="w-3 h-3" /> : mode === 'guide' ? <HelpCircle className="w-3 h-3" /> : <Search className="w-3 h-3" />}
          {isAlternance ? 'Assistant alternance' : mode === 'skills' ? 'Préparation candidature' : mode === 'guide' ? 'Conseils alternance' : 'Recherche'}
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter mb-4">
          {mode === 'alternance' && <>Trouve où candidater en alternance<span className="text-red-600">.</span></>}
          {mode === 'entreprises' && <>Trouvez des entreprises<span className="text-red-600">.</span></>}
          {mode === 'associations' && <>Trouvez des associations<span className="text-green-600">.</span></>}
          {mode === 'skills' && <>Prépare ton CV avec tes skills<span className="text-red-600">.</span></>}
          {mode === 'guide' && <>Décroche ton alternance plus vite<span className="text-red-600">.</span></>}
        </h1>
        <p className="text-zinc-500 text-sm max-w-2xl">
          {mode === 'alternance' && "Trouve les entreprises autour de toi, priorise les contacts, prépare un email de candidature et suis tes relances sans créer de compte."}
          {mode === 'entreprises' && "Recherchez par localisation et secteur d'activité. Obtenez les coordonnées en quelques clics."}
          {mode === 'associations' && "Recherchez par localisation et domaine d'activité. Trouvez les associations près de chez vous."}
          {mode === 'skills' && "Bibliothèque de compétences + formulaire guidé + prompts prêts à copier vers ChatGPT ou Claude."}
          {mode === 'guide' && "Méthode simple, exemples d'emails et bonnes pratiques pour candidater et relancer efficacement."}
        </p>
      </header>

      <main className="px-8 max-w-6xl mx-auto pb-20">
        {isSearchMode && (
          <>
            <div className={`mb-12 border rounded-3xl p-8 md:p-10 relative overflow-hidden ${isAlternance ? 'bg-red-50 border-red-100' : 'bg-zinc-50 border-zinc-200'}`}>
              <div className="absolute top-0 right-0 p-4 opacity-10"><Search className="w-32 h-32 rotate-12" /></div>
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-black text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase mb-6">Mode d'emploi</div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tighter mb-6 leading-tight max-w-3xl">
                  {isAlternance ? <>En quelques minutes, trouve des entreprises et prépare ta <span className="text-red-600">candidature</span>.</> : <>Ici en <span className="text-red-600">2 clics</span> trouve toutes les entreprises dans un périmètre de ton choix.</>}
                </h2>
                <div className="grid md:grid-cols-3 gap-4">
                  {(isAlternance
                    ? ['Choisis ta ville, ton rayon et ton domaine', 'Priorise les entreprises joignables', 'Postule par email prérempli ou ajoute à ta sélection']
                    : ['Localisation & rayon', 'Secteur d’activité', "C'est trouvé !"]
                  ).map((step, index) => <div key={step} className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm"><div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-sm mb-4">{index + 1}</div><p className="text-sm font-medium text-zinc-900">{step}</p></div>)}
                </div>
                {isAlternance && <p className="text-xs text-red-700 mt-5">Les entreprises affichées ne garantissent pas un recrutement en cours : vérifie leurs offres ou contacte-les pour une candidature spontanée.</p>}
              </div>
            </div>

            <div className={isAlternance ? 'grid lg:grid-cols-[1fr_320px] gap-8 items-start' : ''}>
              <div>
                <div className="mb-6"><SearchForm onSearch={performSearch} loading={loading} alternanceMode={isAlternance} /></div>
                {error && <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg"><p className="text-red-600 text-sm font-medium">{error}</p></div>}
                {(results.length > 0 || loading) && <AdBanner className="mb-8" />}
                <section>
                  <ResultsList
                    results={results || []}
                    loading={loading}
                    stats={stats}
                    source={source}
                    onLoadMore={loadMore}
                    loadingMore={loadingMore}
                    hasMore={hasMore}
                    totalResults={totalResults}
                    alternanceMode={isAlternance}
                    selection={isAlternance ? selection : undefined}
                    entitySingular={isAlternance ? 'entreprise à contacter' : undefined}
                    entityPlural={isAlternance ? 'entreprises à contacter' : undefined}
                  />
                </section>
                {results.length > 5 && <AdBanner className="mt-8" />}
              </div>
              {isAlternance && <ApplicationSelectionPanel selection={selection} />}
            </div>
          </>
        )}

        {mode === 'associations' && <AssociationSearch />}
        {mode === 'skills' && <SkillsCVPage />}
        {mode === 'guide' && <AlternanceGuidePage />}
      </main>

      <footer className="border-t border-zinc-200 py-8 px-8 bg-zinc-50">
        <div className="max-w-6xl mx-auto nothing-dot-font text-[9px] text-zinc-400 text-center">© 2026 TROUVETABOITE. TOUS DROITS RÉSERVÉS.</div>
      </footer>
    </div>
  );
}

export default App;
