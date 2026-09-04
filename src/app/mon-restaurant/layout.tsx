import type { Metadata } from "next";

// Métadonnées PWA disponibles dès l'écran de connexion (pas seulement une
// fois dans le tableau de bord) : le personnel doit pouvoir "Ajouter à
// l'écran d'accueil" avant même de s'être connecté. Pas de logique de garde
// ici (session/rôle) — chaque sous-arbre (login, (dashboard)) gère la
// sienne.
export const metadata: Metadata = {
  manifest: "/api/pwa-manifest",
  appleWebApp: {
    capable: true,
    title: "Mon restaurant",
    statusBarStyle: "default",
  },
  icons: {
    apple: "/api/pwa-icon?size=180",
  },
};

export default function MonRestaurantSegmentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
