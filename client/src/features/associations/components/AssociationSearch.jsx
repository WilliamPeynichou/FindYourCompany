import React from 'react';
import { Search } from 'lucide-react';
import { AssociationForm } from './AssociationForm';
import { ResultsList } from '../../search/components/ResultsList';
import { useAssociationSearch } from '../hooks/useAssociationSearch';

const AssociationSearch = () => {
  const { results, loading, loadingMore, error, stats, source, hasMore, totalResults, performSearch, loadMore } = useAssociationSearch();

  return (
    <div>
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
            Ici en <span className="text-green-600">2 clics</span> trouve toutes les associations dans un périmètre de ton choix.
          </h2>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-center">
            <div className="space-y-4">
              <p className="text-zinc-500 text-base md:text-lg leading-relaxed">
                Comment faire ? Indique une ville ou un code postal, puis un rayon de recherche et le domaine d'activité,
                et en 1 clic tu as trouvé toutes les associations que tu voulais.
              </p>
            </div>

            <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-sm">1</div>
                <span className="text-sm font-medium text-zinc-900">Localisation & Rayon</span>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-sm">2</div>
                <span className="text-sm font-medium text-zinc-900">Domaine d'activité</span>
              </div>
              <div className="h-px bg-zinc-100 my-4" />
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm">✓</div>
                <span className="text-sm font-bold text-green-600 uppercase tracking-wider">C'est trouvé !</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <AssociationForm onSearch={performSearch} loading={loading} />
      </div>

      {error && (
        <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm font-medium">{error}</p>
        </div>
      )}

      <section className="mt-4">
        <ResultsList
          results={results || []}
          loading={loading}
          stats={stats}
          source={source}
          emptyTitle="Aucune association trouvée dans cette zone."
          emptyHint="Essayez d'élargir le rayon ou de changer de domaine."
          entitySingular="association trouvée"
          entityPlural="associations trouvées"
          onLoadMore={loadMore}
          loadingMore={loadingMore}
          hasMore={hasMore}
          totalResults={totalResults}
        />
      </section>
    </div>
  );
};

export default AssociationSearch;
