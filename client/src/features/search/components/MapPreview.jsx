import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Circle, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix pour l'icône de marqueur par défaut de Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Composant pour recentrer la carte quand les coordonnées changent
function RecenterMap({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.setView([coords.lat, coords.lon], map.getZoom());
    }
  }, [coords, map]);
  return null;
}

export const MapPreview = ({ location, radius }) => {
  if (!location || !location.lat || !location.lon) return null;

  const position = [parseFloat(location.lat), parseFloat(location.lon)];

  return (
    <div className="h-64 w-full border border-zinc-200 mt-4 overflow-hidden relative z-0">
      <MapContainer 
        center={position} 
        zoom={10} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position} />
        <Circle 
          center={position} 
          radius={radius * 1000} // Convertir km en mètres
          pathOptions={{ 
            fillColor: '#004a7c', 
            color: '#004a7c', 
            weight: 2, 
            opacity: 0.5, 
            fillOpacity: 0.1 
          }} 
        />
        <RecenterMap coords={location} />
      </MapContainer>
      <div className="absolute bottom-2 right-2 z-[1000] bg-white/80 px-1 text-[8px] text-zinc-500">
        © OpenStreetMap
      </div>
    </div>
  );
};

