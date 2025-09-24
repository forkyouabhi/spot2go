"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";

const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface MapPickerProps {
  location: { lat: number; lng: number } | null;
  setLocation: (loc: { lat: number; lng: number }) => void;
  setAddress: (address: string) => void; // New prop
}

export default function MapPicker({ location, setLocation, setAddress }: MapPickerProps) {
  const MapClickMarker = () => {
    useMapEvents({
      click: async (e) => {
        const latlng = e.latlng;
        setLocation(latlng);
        // Reverse geocode using OpenStreetMap Nominatim
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latlng.lat}&lon=${latlng.lng}`
          );
          const data = await res.json();
          setAddress(data.display_name || "");
        } catch {
          setAddress("");
        }
      },
    });
    return location ? <Marker position={location} icon={markerIcon} /> : null;
  };

  const CurrentLocationButton = () => {
  const map = useMapEvents({});
  const useCurrentLocation = async () => {
    if (!navigator.geolocation) return alert("Geolocation not supported");
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const newLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setLocation(newLoc);
      map.setView(newLoc, 15);

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${newLoc.lat}&lon=${newLoc.lng}`
        );
        const data = await res.json();
        setAddress(data.display_name || "");
      } catch {
        setAddress("");
      }
    });
  };

  return (
    <button
      type="button"
      onClick={useCurrentLocation}
      className="absolute top-2 right-2 z-30 bg-[#DC6B19] text-[#FFF8DC] text-sm px-3 py-1 rounded-xl shadow-md hover:bg-[#b45336] transition"
    >
      Use My Location
    </button>
  );
};


  return (
    <MapContainer center={[51.0447, -114.0719]} zoom={13} className="h-64 w-full rounded-xl">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
      />
      <MapClickMarker />
      <CurrentLocationButton />
    </MapContainer>
  );
}
