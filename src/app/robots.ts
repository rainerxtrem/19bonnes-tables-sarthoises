import type { MetadataRoute } from "next";

// Sans ceci, Next.js génère ce fichier une seule fois au moment du build
// (dans l'image Docker, avant que la vraie variable d'environnement de
// production ne soit disponible) et sert ensuite indéfiniment une URL de
// sitemap figée sur localhost — voir le même correctif déjà en place sur
// sitemap.ts.
export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/mon-restaurant", "/api"] }],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
