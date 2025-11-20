"use client";

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { StudyPlace } from '../types';

interface MapControllerProps {
  places: StudyPlace[];
  selectedPlaceId: string | null;
  userLocation: { lat: number; lng: number } | null;
}

export default function MapController({ places, selectedPlaceId, userLocation }: MapControllerProps) {
  const map = useMap();

  // 1. Bounds & View Logic: Fit map to show all places + user location
  useEffect(() => {
    if (!map) return;

    const bounds = new L.LatLngBounds([]);

    // Extend bounds for all valid places
    places.forEach((place) => {
      if (place.location?.lat && place.location?.lng) {
        bounds.extend([place.location.lat, place.location.lng]);
      }
    });

    // Extend bounds for user location if available
    if (userLocation) {
      bounds.extend([userLocation.lat, userLocation.lng]);
    }

    // Fit bounds if we have points, otherwise default to user location or map center
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    } else if (userLocation) {
      map.setView([userLocation.lat, userLocation.lng], 13);
    }
  }, [places, userLocation, map]);

  // 2. Selection Logic: Pan to the selected place when clicked
  useEffect(() => {
    if (!selectedPlaceId || !map) return;

    const selectedPlace = places.find((p) => p.id === selectedPlaceId);
    
    if (selectedPlace?.location?.lat && selectedPlace?.location?.lng) {
      // Smoothly pan to the selected place
      map.setView([selectedPlace.location.lat, selectedPlace.location.lng], 16, {
        animate: true,
      });
    }
  }, [selectedPlaceId, places, map]);

  // This component is logic-only and renders nothing visible
  return null;
}