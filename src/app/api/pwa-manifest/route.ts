import { NextResponse } from "next/server";

// Manifeste de l'espace restaurateur — permet l'installation en "mini app"
// sur l'écran d'accueil (téléphone/tablette de salle). Servi par une route
// plutôt qu'un manifest.ts statique : la convention de fichier spécial
// manifest.ts de Next.js n'est reconnue qu'à la racine du site (vérifié
// dans le code source de Next), impossible donc de la scoper à
// /mon-restaurant sans passer par une route + le champ `metadata.manifest`
// (voir src/app/mon-restaurant/layout.tsx).
export async function GET() {
  const manifest = {
    name: "Espace restaurateur — 19 Bonnes Tables Sarthoises",
    short_name: "Mon restaurant",
    description: "Gérez votre fiche et validez les bons cadeaux des 19 Bonnes Tables Sarthoises.",
    start_url: "/mon-restaurant",
    scope: "/mon-restaurant",
    display: "standalone",
    background_color: "#faf6ee",
    theme_color: "#7d2b2f",
    icons: [
      { src: "/api/pwa-icon?size=192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/api/pwa-icon?size=512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/api/pwa-icon?size=512&padded=1", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };

  return NextResponse.json(manifest, { headers: { "Content-Type": "application/manifest+json" } });
}
