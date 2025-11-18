"use client";

import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L, { LeafletMouseEvent } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";

const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface MapPickerProps {
  location: { lat: number; lng: number } | null;
  setLocation: (loc: { lat: number; lng: number }) => void;
  setAddress: (address: string) => void; 
}

// --- NEW: Component to update map view when location changes externally ---
function MapUpdater({ location }: { location: { lat: number; lng: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (location) {
      map.flyTo(location, 16, { duration: 1.5 });
    }
  }, [location, map]);
  return null;
}

function CurrentLocationButton({ setLocation, setAddress }: { setLocation: MapPickerProps['setLocation'], setAddress: MapPickerProps['setAddress'] }) {
  const map = useMapEvents({});
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (buttonRef.current) {
      L.DomEvent.disableClickPropagation(buttonRef.current);
      L.DomEvent.disableScrollPropagation(buttonRef.current);
    }
  }, []);

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const newLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setLocation(newLoc);
      map.setView(newLoc, 16);

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
      ref={buttonRef}
      type="button"
      onClick={useCurrentLocation}
      className="absolute top-2 right-2 z-[1000] bg-[#DC6B19] text-[#FFF8DC] text-sm px-3 py-1 rounded-xl shadow-md hover:bg-[#b45336] transition"
    >
      Use My Location
    </button>
  );
};

export default function MapPicker({ location, setLocation, setAddress }: MapPickerProps) {
  const MapClickHandler = () => {
    useMapEvents({
      click: async (e: LeafletMouseEvent) => {
        const latlng = e.latlng;
        setLocation(latlng);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latlng.lat}&lon=${latlng.lng}`
          );
          const data = await res.json();
          setAddress(data.display_name || "Address not found");
        } catch {
          setAddress("Could not fetch address");
        }
      },
    });
    return location ? <Marker position={location} icon={markerIcon} /> : null;
  };

  return (
    <MapContainer center={[48.3809, -89.2477]} zoom={13} className="h-64 w-full rounded-xl">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
      />
      <MapClickHandler />
      {/* Add the Updater here to handle external updates */}
      <MapUpdater location={location} />
      <CurrentLocationButton setLocation={setLocation} setAddress={setAddress} />
    </MapContainer>
  );
}