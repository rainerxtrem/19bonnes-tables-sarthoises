"use client";

import { useEffect, useState, type CSSProperties } from "react";
import type { SiteTheme } from "@prisma/client";

/**
 * Décor animé discret du thème saisonnier (neige, confettis, pétales,
 * cœurs). Purement décoratif : pointer-events none, aria-hidden, masqué
 * pour `prefers-reduced-motion` (voir `.seasonal-particle` dans
 * globals.css). Les particules sont tirées au hasard côté client
 * uniquement, après le montage, pour éviter tout écart d'hydratation.
 */

type Kind = "snow" | "confetti" | "petal" | "heart";

const KIND_BY_THEME: Partial<Record<SiteTheme, Kind>> = {
  NOEL: "snow",
  NOUVEL_AN: "confetti",
  PAQUES: "petal",
  SAINT_VALENTIN: "heart",
};

const COLORS: Record<Kind, string[]> = {
  snow: ["rgb(var(--c-ink-200))", "rgb(var(--c-ink-300))", "rgb(var(--c-gold-300))"],
  confetti: ["rgb(var(--c-gold-400))", "rgb(var(--c-gold-200))", "rgb(var(--c-wine-400))", "rgb(var(--c-ink-300))"],
  petal: ["#f6c6d6", "#f8e08e", "rgb(var(--c-wine-200))", "rgb(var(--c-gold-200))"],
  heart: ["rgb(var(--c-wine-300))", "rgb(var(--c-wine-400))", "rgb(var(--c-gold-300))"],
};

interface Particle {
  id: number;
  style: CSSProperties;
}

function random(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export function SeasonalEffects({ theme }: { theme: SiteTheme }) {
  const kind = KIND_BY_THEME[theme];
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!kind) {
      setParticles([]);
      return;
    }
    const count = window.innerWidth < 640 ? 10 : 20;
    const colors = COLORS[kind];
    setParticles(
      Array.from({ length: count }, (_, id) => {
        const size = kind === "confetti" ? random(6, 10) : random(10, 20);
        return {
          id,
          style: {
            left: `${random(0, 100)}%`,
            fontSize: `${size}px`,
            width: kind === "confetti" || kind === "petal" ? `${size}px` : undefined,
            height: kind === "confetti" ? `${size * 1.6}px` : kind === "petal" ? `${size}px` : undefined,
            color: colors[id % colors.length],
            backgroundColor: kind === "confetti" || kind === "petal" ? colors[id % colors.length] : undefined,
            opacity: random(0.45, 0.85),
            animationDuration: `${random(kind === "heart" ? 9 : 10, 18)}s`,
            // Délai négatif : les particules sont déjà réparties à l'écran
            // dès l'arrivée sur la page au lieu de tomber toutes ensemble.
            animationDelay: `-${random(0, 18)}s`,
            ["--drift" as string]: `${random(-60, 60)}px`,
          },
        };
      })
    );
  }, [kind]);

  if (!kind || particles.length === 0) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-30 overflow-hidden">
      {particles.map((p) => (
        <span key={p.id} className={`seasonal-particle seasonal-${kind}`} style={p.style}>
          {kind === "snow" ? "❄︎" : kind === "heart" ? "♥︎" : null}
        </span>
      ))}
    </div>
  );
}
