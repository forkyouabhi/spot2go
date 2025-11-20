// services/web/src/components/InteractiveMap.tsx
"use client";

import { useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import "leaflet/dist/leaflet.css"; // Import CSS globally or here
import { StudyPlace } from "../types";

// 1. Dynamically import MapContainer and other Leaflet components
// This prevents "window is not defined" and reduces initial bundle size
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false, loading: () => <div className="h-full w-full bg-gray-100 animate-pulse rounded-lg" /> }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);
const MapController = dynamic(
  () => import('./MapController'), // We will extract the logic to a separate component
  { ssr: false }
);

// Define Props
interface MapProps {
  places: StudyPlace[];
  selectedPlaceId: string | null;
  userLocation: { lat: number; lng: number } | null;
}

export default function InteractiveMap({ places, selectedPlaceId, userLocation }: MapProps) {
  // Default center (Thunder Bay, as seen in your code)
  const defaultCenter = useMemo(() => 
    userLocation || { lat: 48.3809, lng: -89.2477 }, 
  [userLocation]);

  // Fix for default Leaflet marker icons in Webpack/Next.js
  useEffect(() => {
    (async function initLeaflet() {
      const L = (await import('leaflet')).default;
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
      });
    })();
  }, []);

  if (typeof window === 'undefined') return null;

  return (
    <div className="h-[500px] w-full rounded-lg overflow-hidden z-0">
      <MapContainer 
        center={defaultCenter} 
        zoom={13} 
        className="h-full w-full"
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* MapController handles bounds and view updates */}
        <MapController 
          places={places} 
          selectedPlaceId={selectedPlaceId} 
          userLocation={userLocation} 
        />
        
        {/* Render Markers */}
        {places.map(place => (
          place.location?.lat && place.location?.lng && (
             <Marker 
               key={place.id} 
               position={[place.location.lat, place.location.lng]}
             >
               <Popup>
                 <span className="font-bold">{place.name}</span>
                 <br />
                 {place.location.address}
               </Popup>
             </Marker>
          )
        ))}
      </MapContainer>
    </div>
  );
}