"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import Link from "next/link";

export interface MapRestaurant {
  id: string;
  slug: string;
  name: string;
  city: string | null;
  latitude: number;
  longitude: number;
}

// Punaise maison (encre/or) plutôt que l'icône par défaut de Leaflet, dont
// les images ne se résolvent pas correctement une fois passées par le
// bundler — évite tout le contournement habituel de L.Icon.Default.
const pinIcon = L.divIcon({
  className: "",
  html: `<div style="width:30px;height:30px;border-radius:50% 50% 50% 0;background:#7d2b2f;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(23,19,15,.45);border:2px solid #faf6ee;">
    <div style="transform:rotate(45deg);width:9px;height:9px;border-radius:50%;background:#faf6ee;"></div>
  </div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -28],
});

export function RestaurantsMap({ restaurants }: { restaurants: MapRestaurant[] }) {
  if (restaurants.length === 0) return null;

  const center: [number, number] = [
    restaurants.reduce((sum, r) => sum + r.latitude, 0) / restaurants.length,
    restaurants.reduce((sum, r) => sum + r.longitude, 0) / restaurants.length,
  ];

  return (
    <MapContainer
      center={center}
      zoom={9}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%" }}
      // Le fond de carte reste lisible en thème sombre comme clair, le site
      // n'ayant pas de mode sombre dédié — pas de filtre CSS nécessaire.
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {restaurants.map((r) => (
        <Marker key={r.id} position={[r.latitude, r.longitude]} icon={pinIcon}>
          <Popup>
            <div className="min-w-[160px] font-sans">
              <p className="font-semibold text-ink-900">{r.name}</p>
              {r.city ? <p className="mt-0.5 text-xs text-ink-500">{r.city}</p> : null}
              <Link href={`/${r.slug}`} className="mt-1.5 inline-block text-xs font-medium text-wine-700 hover:underline">
                Voir la fiche →
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
