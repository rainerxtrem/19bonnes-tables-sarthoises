"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { SiteTheme } from "@prisma/client";

/**
 * Décor animé du thème saisonnier : particules (neige, confettis, pétales,
 * cœurs), feux d'artifice pour le Nouvel an, et petite gerbe de symboles à
 * chaque clic. Purement décoratif : pointer-events none, aria-hidden, et
 * entièrement masqué pour `prefers-reduced-motion` (voir globals.css).
 * Le hasard n'est tiré qu'après le montage pour éviter tout écart
 * d'hydratation.
 */

type Kind = "snow" | "confetti" | "petal" | "heart";

const KIND_BY_THEME: Partial<Record<SiteTheme, Kind>> = {
  NOEL: "snow",
  NOUVEL_AN: "confetti",
  PAQUES: "petal",
  SAINT_VALENTIN: "heart",
};

const COLORS: Record<Kind, string[]> = {
  snow: ["rgb(var(--c-ink-200))", "rgb(var(--c-ink-300))", "#b9d3e6", "rgb(var(--c-gold-300))"],
  confetti: ["rgb(var(--c-gold-400))", "rgb(var(--c-gold-200))", "rgb(var(--c-wine-400))", "#e6e9f2", "#e86f9a"],
  petal: ["#f6c6d6", "#f8e08e", "rgb(var(--c-wine-200))", "#bfe3c0", "#a8d8f0"],
  heart: ["rgb(var(--c-wine-300))", "rgb(var(--c-wine-400))", "rgb(var(--c-gold-300))", "#f3a0b6"],
};

/** Glyphes texte (variation selector U+FE0E : jamais rendus en emoji). */
const GLYPHS: Partial<Record<Kind, string[]>> = {
  snow: ["❄︎", "❅︎", "❆︎", "•"],
  heart: ["♥︎", "♥︎", "♡︎"],
};

const BURST_GLYPHS: Record<Kind, string[]> = {
  snow: ["❄︎", "❆︎"],
  confetti: ["✦︎", "★︎"],
  petal: ["✿︎", "❀︎"],
  heart: ["♥︎"],
};

interface Particle {
  id: number;
  glyph: string | null;
  style: CSSProperties;
}

interface Firework {
  id: number;
  style: CSSProperties;
  color: string;
}

interface Burst {
  id: number;
  x: number;
  y: number;
}

function random(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function pick<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)]!;
}

export function SeasonalEffects({ theme }: { theme: SiteTheme }) {
  const kind = KIND_BY_THEME[theme];
  const [particles, setParticles] = useState<Particle[]>([]);
  const [fireworks, setFireworks] = useState<Firework[]>([]);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const burstId = useRef(0);

  useEffect(() => {
    if (!kind) {
      setParticles([]);
      setFireworks([]);
      return;
    }
    const mobile = window.innerWidth < 640;
    const count = mobile ? 14 : 30;
    const colors = COLORS[kind];
    const glyphs = GLYPHS[kind];
    const isShape = kind === "confetti" || kind === "petal";

    setParticles(
      Array.from({ length: count }, (_, id) => {
        const size = kind === "confetti" ? random(6, 10) : kind === "snow" ? random(8, 22) : kind === "heart" ? random(12, 26) : random(10, 20);
        const color = colors[id % colors.length]!;
        return {
          id,
          glyph: glyphs ? pick(glyphs) : null,
          style: {
            left: `${random(0, 100)}%`,
            fontSize: `${size}px`,
            width: isShape ? `${size}px` : undefined,
            height: kind === "confetti" ? `${size * 1.6}px` : kind === "petal" ? `${size}px` : undefined,
            color,
            backgroundColor: isShape ? color : undefined,
            opacity: random(0.45, 0.85),
            animationDuration: `${random(kind === "heart" ? 9 : 10, 20)}s`,
            // Délai négatif : particules déjà réparties dès l'arrivée.
            animationDelay: `-${random(0, 20)}s`,
            ["--drift" as string]: `${random(-70, 70)}px`,
          },
        };
      })
    );

    // Feux d'artifice : quelques éclats qui se rallument à tour de rôle
    // dans le haut de l'écran.
    if (kind === "confetti") {
      setFireworks(
        Array.from({ length: mobile ? 2 : 4 }, (_, id) => ({
          id,
          color: colors[id % colors.length]!,
          style: {
            left: `${random(8, 92)}%`,
            top: `${random(12, 42)}%`,
            animationDelay: `${id * 1.3 + random(0, 0.8)}s`,
            ["--fw-size" as string]: `${random(50, 90)}px`,
          },
        }))
      );
    } else {
      setFireworks([]);
    }
  }, [kind]);

  // Petite gerbe de symboles à chaque clic / tap.
  useEffect(() => {
    if (!kind) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    function onClick(event: MouseEvent) {
      const id = ++burstId.current;
      setBursts((list) => [...list.slice(-5), { id, x: event.clientX, y: event.clientY }]);
      window.setTimeout(() => setBursts((list) => list.filter((b) => b.id !== id)), 900);
    }
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, [kind]);

  if (!kind) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-30 overflow-hidden">
      {particles.map((p) => (
        <span key={p.id} className={`seasonal-particle seasonal-${kind}`} style={p.style}>
          {p.glyph}
        </span>
      ))}

      {fireworks.map((fw) => (
        <span key={fw.id} className="seasonal-firework" style={fw.style}>
          {Array.from({ length: 12 }, (_, i) => (
            <span
              key={i}
              className="seasonal-firework-spark"
              style={{ ["--a" as string]: `${i * 30}deg`, backgroundColor: fw.color, color: fw.color }}
            />
          ))}
        </span>
      ))}

      {bursts.map((b) => (
        <span key={b.id} className="seasonal-burst" style={{ left: b.x, top: b.y }}>
          {Array.from({ length: 8 }, (_, i) => (
            <span
              key={i}
              className="seasonal-burst-piece"
              style={{
                ["--a" as string]: `${i * 45}deg`,
                color: COLORS[kind][i % COLORS[kind].length],
              }}
            >
              {BURST_GLYPHS[kind][i % BURST_GLYPHS[kind].length]}
            </span>
          ))}
        </span>
      ))}
    </div>
  );
}
