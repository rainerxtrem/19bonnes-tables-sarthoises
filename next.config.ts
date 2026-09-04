import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  // pdfkit lit ses métriques de polices standard (.afm) via fs à
  // l'exécution, avec un chemin non statiquement analysable par le
  // file-tracer de Next — sans ceci, le dossier est absent du build
  // standalone et la génération de PDF (bons cadeaux) échoue en prod.
  outputFileTracingIncludes: {
    "/api/webhooks/stripe": ["./node_modules/pdfkit/js/data/**"],
    "/api/admin/gift-vouchers/[id]/pdf": ["./node_modules/pdfkit/js/data/**"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  // Conservation du référencement de l'ancien site B12 (voir audit Phase 1).
  // Restaurants, /le-bureau, /partenaires, /galerie et /bon-cadeaux gardent
  // exactement la même URL sur le nouveau site : aucune redirection requise
  // pour eux. Le reste de la table Redirect (ajouts futurs, cas particuliers)
  // est géré dynamiquement en base via /admin/redirections + middleware.
  async redirects() {
    return [
      { source: "/linsouciant", destination: "/l-insouciant", permanent: true },
      { source: "/galerie-le-cheval-blanc", destination: "/galerie/le-cheval-blanc", permanent: true },
      { source: "/galerie-le-jardin-gourmand", destination: "/galerie/le-jardin-gourmand", permanent: true },
      { source: "/galerie-l-insouciant", destination: "/galerie/l-insouciant", permanent: true },
      { source: "/galerie-les-etangs-de-guibert", destination: "/galerie/les-etangs-de-guibert", permanent: true },
      { source: "/galerie-l-ardoise", destination: "/galerie/l-ardoise", permanent: true },
      { source: "/galerie-la-petite-auberge", destination: "/galerie/la-petite-auberge", permanent: true },
      { source: "/galerie-le-panier-fleuri", destination: "/galerie/le-panier-fleuri", permanent: true },
      { source: "/galerie-hotel-la-renaissance", destination: "/galerie/hotel-restaurant-la-renaissance", permanent: true },
      { source: "/galerie-les-tables-de-la-fontaine", destination: "/galerie/les-tables-de-la-fontaine", permanent: true },
      { source: "/galerie-les-jardins-de-marolles", destination: "/galerie/les-jardins-de-marolles", permanent: true },
      // Fiches "équipe" et "service" jamais liées dans la navigation B12
      // (voir audit, section 12) : renvoyées vers les pages pertinentes.
      { source: "/luke-mcgraw", destination: "/le-bureau", permanent: true },
      { source: "/nick-burke", destination: "/le-bureau", permanent: true },
      { source: "/rebecca-lopes", destination: "/le-bureau", permanent: true },
      { source: "/madeline-blais", destination: "/le-bureau", permanent: true },
      { source: "/19-bonnes-tables-sarthoises-562502", destination: "/le-bureau", permanent: true },
      { source: "/everyday-is-a-winding-road", destination: "/actualites", permanent: true },
      { source: "/service-title-7", destination: "/", permanent: true },
      { source: "/service-title-8", destination: "/", permanent: true },
      { source: "/gourmet-dinners", destination: "/", permanent: true },
      { source: "/farm-to-table", destination: "/", permanent: true },
      { source: "/chefs-table-experience", destination: "/", permanent: true },
      { source: "/wine-pairing", destination: "/", permanent: true },
      { source: "/local-specialties", destination: "/", permanent: true },
      { source: "/reschedule-appointment", destination: "/", permanent: true },
      { source: "/cancel-appointment", destination: "/", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
