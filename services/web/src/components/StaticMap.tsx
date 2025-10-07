"use client";

import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface StaticMapProps {
  location: {
    lat?: number;
    lng?: number;
  };
}

export function StaticMap({ location }: StaticMapProps) {
  if (typeof location.lat !== 'number' || typeof location.lng !== 'number') {
    return <div className="h-full w-full bg-gray-200 flex items-center justify-center rounded-lg"><p className="text-xs text-gray-500">Location data not available</p></div>;
  }

  const position: [number, number] = [location.lat, location.lng];

  return (
    <MapContainer 
      center={position} 
      zoom={15} 
      className="h-full w-full"
      dragging={false}
      zoomControl={false}
      scrollWheelZoom={false}
      doubleClickZoom={false}
      attributionControl={false}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
      <Marker position={position} icon={markerIcon} />
    </MapContainer>
  );
}