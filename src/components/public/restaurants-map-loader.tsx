"use client";

import dynamic from "next/dynamic";
import type { MapRestaurant } from "./restaurants-map";

// Leaflet touche `window`/`document` dès son chargement : impossible à
// rendre côté serveur. `ssr: false` n'est autorisé par next/dynamic que
// depuis un Client Component, d'où ce petit wrapper dédié — la page
// d'accueil (Server Component) ne fait que lui passer les données.
const RestaurantsMap = dynamic(() => import("./restaurants-map").then((mod) => mod.RestaurantsMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-ink-100 text-sm text-ink-400">
      Chargement de la carte…
    </div>
  ),
});

export function RestaurantsMapLoader({ restaurants }: { restaurants: MapRestaurant[] }) {
  return <RestaurantsMap restaurants={restaurants} />;
}
