import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

// Icône PWA générée à la volée (badge "19" sur fond encre, identique au
// motif déjà utilisé sur l'écran de connexion admin) plutôt qu'un fichier
// PNG statique à maintenir — un seul composant sert toutes les tailles
// demandées par le manifeste (voir /api/pwa-manifest) et l'apple-touch-icon.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const size = Number(searchParams.get("size")) || 512;
  // Icône "maskable" : l'OS peut recadrer l'image en cercle/rond de coin —
  // le motif doit tenir dans la zone de sécurité centrale (~80%), d'où un
  // texte plus petit et un fond qui va bord à bord (jamais de transparence).
  const padded = searchParams.get("padded") === "1";
  const fontSize = Math.round(size * (padded ? 0.32 : 0.42));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#17130f",
        }}
      >
        <span style={{ fontSize, fontWeight: 700, color: "#cda047" }}>19</span>
      </div>
    ),
    { width: size, height: size }
  );
}
