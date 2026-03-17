import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { SearchForm } from './features/search/components/SearchForm';
import { ResultsList } from './features/search/components/ResultsList';
import { useSearch } from './features/search/hooks/useSearch';
import { AdBanner } from './components/AdSense';
import AssociationSearch from './features/associations/components/AssociationSearch';

function App() {
  const { results, loading, loadingMore, error, stats, source, hasMore, totalResults, performSearch, loadMore } = useSearch();
  const [mode, setMode] = useState('entreprises');

  return (
    <div className="min-h-screen nothing-bg font-sans text-black">
      {/* Header Minimaliste */}
      <nav className="border-b border-zinc-200 py-4 px-8 bg-white">
        <div className="nothing-dot-font text-lg font-black tracking-tighter">
          TROUVETABOITE<span className="text-red-600">.</span>
        </div>
      </nav>

      {/* Hero Simplifié */}
      <header className="pt-16 pb-12 px-8 max-w-6xl mx-auto">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter mb-4">
          {mode === 'entreprises' ? (
            <>Trouvez des entreprises<span className="text-red-600">.</span></>
          ) : (
            <>Trouvez des associations<span className="text-green-600">.</span></>
          )}
        </h1>
        <p className="text-zinc-500 text-sm max-w-md">
          {mode === 'entreprises'
            ? "Recherchez par localisation et secteur d'activité. Obtenez les coordonnées en quelques clics."
            : "Recherchez par localisation et domaine d'activité. Trouvez les associations près de chez vous."}
        </p>
      </header>

      {/* Formulaire */}
      <main className="px-8 max-w-6xl mx-auto pb-20">

        {/* Tab switcher */}
        <div className="flex gap-1 bg-zinc-100 p-1 rounded-full w-fit mb-8 mx-auto">
          <button
            onClick={() => setMode('entreprises')}
            className={mode === 'entreprises'
              ? 'bg-white shadow px-3 sm:px-5 py-1.5 rounded-full text-xs sm:text-sm font-semibold'
              : 'px-3 sm:px-5 py-1.5 text-xs sm:text-sm text-zinc-500 hover:text-zinc-700'}
          >
            Entreprises
          </button>
          <button
            onClick={() => setMode('associations')}
            className={mode === 'associations'
              ? 'bg-white shadow px-3 sm:px-5 py-1.5 rounded-full text-xs sm:text-sm font-semibold'
              : 'px-3 sm:px-5 py-1.5 text-xs sm:text-sm text-zinc-500 hover:text-zinc-700'}
          >
            Associations
          </button>
        </div>

        {mode === 'entreprises' && (
          <>
            {/* Section explicative */}
            <div className="mb-12 bg-zinc-50 border border-zinc-200 rounded-3xl p-8 md:p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Search className="w-32 h-32 rotate-12" />
              </div>

              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-black text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase mb-6">
                  Mode d'emploi
                </div>

                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tighter mb-6 leading-tight max-w-2xl">
                  Ici en <span className="text-red-600">2 clics</span> trouve toutes les entreprises dans un périmètre de ton choix.
                </h2>

                <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-center">
                  <div className="space-y-4">
                    <p className="text-zinc-500 text-base md:text-lg leading-relaxed">
                      Comment faire ? Indique une ville ou un code postal, puis un rayon de recherche et le secteur d'activité,
                      et en 1 clic tu as trouvé toutes les entreprises que tu voulais.
                    </p>
                  </div>

                  <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-sm">1</div>
                      <span className="text-sm font-medium text-zinc-900">Localisation & Rayon</span>
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-sm">2</div>
                      <span className="text-sm font-medium text-zinc-900">Secteur d'activité</span>
                    </div>
                    <div className="h-px bg-zinc-100 my-4" />
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-sm">✓</div>
                      <span className="text-sm font-bold text-red-600 uppercase tracking-wider">C'est trouvé !</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <SearchForm onSearch={performSearch} loading={loading} />
            </div>

            {/* Messages d'erreur */}
            {error && (
              <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Bannière publicitaire - avant les résultats */}
            {(results.length > 0 || loading) && (
              <AdBanner className="mb-8" />
            )}

            {/* Résultats */}
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
              />
            </section>

            {/* Bannière publicitaire - après les résultats */}
            {results.length > 5 && (
              <AdBanner className="mt-8" />
            )}
          </>
        )}

        {mode === 'associations' && <AssociationSearch />}

      </main>

      {/* Footer Minimaliste */}
      <footer className="border-t border-zinc-200 py-8 px-8 bg-zinc-50">
        <div className="max-w-6xl mx-auto nothing-dot-font text-[9px] text-zinc-400 text-center">
          © 2026 TROUVETABOITE. TOUS DROITS RÉSERVÉS.
        </div>
      </footer>
    </div>
  );
}

export default App;
