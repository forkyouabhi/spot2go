"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { StudyPlace } from "../types";
import { useEffect, useRef } from "react";

const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const userIcon = L.divIcon({
  className: 'user-location-pin',
  html: `<div style="background-color: #007bff; width: 1.5rem; height: 1.5rem; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

interface MapControllerProps {
  places: StudyPlace[];
  selectedPlaceId: string | null;
  userLocation: L.LatLngLiteral | null;
}

function MapController({ places, selectedPlaceId, userLocation }: MapControllerProps) {
  const map = useMap();
  const markerRefs = useRef<{ [key: string]: L.Marker }>({});

  useEffect(() => {
    const bounds = new L.LatLngBounds([]);
    places.forEach(place => {
      if (place.location?.lat && place.location?.lng) {
        bounds.extend([place.location.lat, place.location.lng]);
      }
    });
    if (userLocation) {
        bounds.extend([userLocation.lat, userLocation.lng]);
    }

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    } else if (userLocation) {
        map.setView(userLocation, 13);
    }
  }, [places, userLocation, map]);
  
  useEffect(() => {
    if (selectedPlaceId) {
      const marker = markerRefs.current[selectedPlaceId];
      if (marker) {
        marker.openPopup();
        map.panTo(marker.getLatLng());
      }
    }
  }, [selectedPlaceId, map]);

  return (
    <>
      {userLocation && <Marker position={userLocation} icon={userIcon}><Popup>You are here</Popup></Marker>}
      {places.map((place) => (
        place.location?.lat && place.location?.lng && (
          <Marker
            key={place.id}
            position={[place.location.lat, place.location.lng]}
            icon={markerIcon}
            ref={el => { if (el) markerRefs.current[place.id] = el; }}
          >
            <Popup>
              <div className="font-semibold text-brand-burgundy">{place.name}</div>
              <div className="text-xs text-gray-600">{place.location.address}</div>
            </Popup>
          </Marker>
        )
      ))}
    </>
  );
}

export function InteractiveMap({ places, selectedPlaceId, userLocation }: MapControllerProps) {
  const defaultCenter: L.LatLngLiteral = userLocation || { lat: 48.3809, lng: -89.2477 };

  return (
    <MapContainer center={defaultCenter} zoom={13} className="h-full w-full rounded-lg">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
      <MapController places={places} selectedPlaceId={selectedPlaceId} userLocation={userLocation} />
    </MapContainer>
  );
}