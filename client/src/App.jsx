import React from 'react';
import { SearchForm } from './features/search/components/SearchForm';
import { ResultsList } from './features/search/components/ResultsList';
import { useSearch } from './features/search/hooks/useSearch';

function App() {
  const { results, loading, performSearch } = useSearch();

  return (
    <div className="min-h-screen nothing-bg font-sans text-black">
      {/* Header Minimaliste */}
      <nav className="border-b border-zinc-200 py-4 px-8 bg-white">
        <div className="nothing-dot-font text-lg font-black tracking-tighter">
          FINDYOURCOMPANY<span className="text-red-600">.</span>
        </div>
      </nav>

      {/* Hero Simplifié */}
      <header className="pt-16 pb-12 px-8 max-w-6xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tighter mb-4">
          Trouvez des entreprises<span className="text-red-600">.</span>
        </h1>
        <p className="text-zinc-500 text-sm max-w-md">
          Recherchez par localisation et secteur d'activité. Obtenez les coordonnées en quelques clics.
        </p>
      </header>

      {/* Formulaire */}
      <main className="px-8 max-w-6xl mx-auto pb-20">
        <div className="mb-12">
          <SearchForm onSearch={performSearch} loading={loading} />
        </div>

        {/* Résultats */}
        <section>
          <ResultsList results={results || []} loading={loading} />
        </section>
      </main>

      {/* Footer Minimaliste */}
      <footer className="border-t border-zinc-200 py-8 px-8 bg-zinc-50">
        <div className="max-w-6xl mx-auto nothing-dot-font text-[9px] text-zinc-400 text-center">
          © 2026 FINDYOURCOMPANY. TOUS DROITS RÉSERVÉS.
        </div>
      </footer>
    </div>
  );
}

export default App;
