import React, { useEffect, useRef } from 'react';

/**
 * Composant pour afficher une unité publicitaire Google AdSense
 * 
 * Utilisation simple :
 * <AdUnit slot="1234567890" />
 * 
 * Avec format personnalisé :
 * <AdUnit slot="1234567890" format="rectangle" />
 */
export const AdUnit = ({ 
  slot,           // ID du bloc d'annonces (requis si pas en mode auto)
  format = 'auto', // auto, rectangle, horizontal, vertical
  responsive = true,
  className = ''
}) => {
  const adRef = useRef(null);
  const isLoaded = useRef(false);

  useEffect(() => {
    // Ne charger qu'une seule fois
    if (isLoaded.current) return;
    
    try {
      // Vérifier si AdSense est chargé
      if (window.adsbygoogle && adRef.current) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        isLoaded.current = true;
      }
    } catch (error) {
      console.error('Erreur AdSense:', error);
    }
  }, []);

  // En développement, afficher un placeholder
  if (import.meta.env.DEV) {
    return (
      <div className={`bg-zinc-100 border-2 border-dashed border-zinc-300 rounded-lg flex items-center justify-center text-zinc-400 text-sm ${className}`}
           style={{ minHeight: format === 'horizontal' ? '90px' : format === 'rectangle' ? '250px' : '100px' }}>
        <div className="text-center p-4">
          <span className="block text-xs uppercase tracking-wider font-medium mb-1">Publicité</span>
          <span className="text-xs">Slot: {slot || 'auto'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-9331269623257147"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
};

/**
 * Bannière publicitaire pour le haut de page
 */
export const AdBanner = ({ className = '' }) => (
  <div className={`my-4 ${className}`}>
    <AdUnit format="horizontal" className="min-h-[90px]" />
  </div>
);

/**
 * Rectangle publicitaire (sidebar, entre contenu)
 */
export const AdRectangle = ({ className = '' }) => (
  <div className={`my-6 ${className}`}>
    <AdUnit format="rectangle" className="min-h-[250px]" />
  </div>
);

/**
 * Publicité in-feed (entre les résultats)
 */
export const AdInFeed = ({ className = '' }) => (
  <div className={`my-4 ${className}`}>
    <AdUnit format="fluid" className="min-h-[100px]" />
  </div>
);

export default AdUnit;
