import type { SiteTheme } from "@prisma/client";

/**
 * Guirlande décorative suspendue sous le header (ampoules, étoiles,
 * fanions ou cœurs selon le thème). Positions et couleurs fixes (pas de
 * hasard) : rendu identique serveur/client. Les animations sont coupées
 * pour `prefers-reduced-motion` (voir globals.css).
 */

const SEGMENT = 56;
const COUNT = 40; // ~2240px : couvre les écrans larges, rogné par overflow-hidden

const PALETTES: Partial<Record<SiteTheme, string[]>> = {
  NOEL: ["#d62f36", "#e8b437", "#2f8a4c", "#3a7bd5"],
  NOUVEL_AN: ["rgb(var(--c-gold-300))", "#e6e9f2", "rgb(var(--c-gold-400))", "#c9d3ee"],
  PAQUES: ["#f6c6d6", "#f8e08e", "#bfe3c0", "#c9b8ec", "#a8d8f0"],
  SAINT_VALENTIN: ["rgb(var(--c-wine-400))", "rgb(var(--c-wine-300))", "rgb(var(--c-gold-300))"],
};

function Ornament({ theme, color }: { theme: SiteTheme; color: string }) {
  const cx = SEGMENT / 2;
  switch (theme) {
    case "NOEL":
      return (
        <g>
          <rect x={cx - 3} y={12} width={6} height={4} rx={1} fill="#6b6b6b" />
          <ellipse cx={cx} cy={22} rx={5} ry={7} fill={color} className="garland-blink" />
        </g>
      );
    case "NOUVEL_AN":
      return (
        <path
          className="garland-twinkle"
          fill={color}
          d={`M${cx} 11 l2.6 5.6 6 .6 -4.6 4 1.4 6 -5.4 -3.2 -5.4 3.2 1.4 -6 -4.6 -4 6 -.6z`}
        />
      );
    case "PAQUES":
      return <path className="garland-sway" fill={color} d={`M${cx - 9} 8 L${cx + 9} 8 L${cx} 27 Z`} />;
    case "SAINT_VALENTIN":
      return (
        <path
          className="garland-pulse"
          fill={color}
          d={`M${cx} 28 C${cx - 11} 20 ${cx - 9} 11 ${cx - 4} 12 C${cx - 1.5} 12.5 ${cx} 15 ${cx} 15 C${cx} 15 ${cx + 1.5} 12.5 ${cx + 4} 12 C${cx + 9} 11 ${cx + 11} 20 ${cx} 28 Z`}
        />
      );
    default:
      return null;
  }
}

export function SeasonalGarland({ theme }: { theme: SiteTheme }) {
  const colors = PALETTES[theme];
  if (!colors) return null;
  // Fanions : fil presque tendu ; autres : festons arrondis.
  const wire = theme === "PAQUES" ? `M0 6 Q${SEGMENT / 2} 10 ${SEGMENT} 6` : `M0 2 Q${SEGMENT / 2} 18 ${SEGMENT} 2`;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-full h-8 overflow-hidden">
      <div className="flex">
        {Array.from({ length: COUNT }, (_, i) => (
          <svg
            key={i}
            width={SEGMENT}
            height={32}
            viewBox={`0 0 ${SEGMENT} 32`}
            className="shrink-0 overflow-visible"
            style={{ ["--garland-delay" as string]: `${(i % 7) * 0.35}s` }}
          >
            <path d={wire} fill="none" stroke="rgb(var(--c-ink-400))" strokeWidth={1.2} opacity={0.7} />
            <Ornament theme={theme} color={colors[i % colors.length]!} />
          </svg>
        ))}
      </div>
    </div>
  );
}
