import type { SiteTheme } from "@prisma/client";

/**
 * Décor en silhouette posé juste au-dessus du footer (même couleur que son
 * fond, ink-950) : collines et sapins enneigés, ville de nuit, herbe et
 * œufs, vague de cœurs. Tout est déterministe (aucun hasard).
 */

const FILL = "rgb(var(--c-ink-950))";
const W = 1440;
const H = 90;

/** Sapin à trois étages, base enfoncée dans la colline. */
function pine(x: number, h: number) {
  const base = 88;
  const w = h * 0.62;
  const tiers = [0, 0.3, 0.58].map((t, i) => {
    const top = base - h + t * h;
    const bottom = top + h * (0.48 + i * 0.04);
    const half = (w / 2) * (0.55 + i * 0.22);
    return `M${x} ${top} L${x + half} ${bottom} L${x - half} ${bottom} Z`;
  });
  return (
    <g key={`p${x}`}>
      <path d={tiers.join(" ")} fill={FILL} />
      <path d={`M${x} ${base - h} L${x + w * 0.1} ${base - h * 0.84} L${x - w * 0.1} ${base - h * 0.84} Z`} fill="#ffffff" />
    </g>
  );
}

function Noel() {
  const trees: Array<[number, number]> = [
    [60, 78], [112, 60], [300, 56], [440, 84], [492, 66], [760, 58], [900, 80], [948, 62],
    [1150, 86], [1204, 68], [1330, 60], [1392, 76],
  ];
  return (
    <>
      <path d={`M0 70 Q180 38 360 62 T720 58 T1080 54 T1440 60 V${H} H0 Z`} fill={FILL} />
      {trees.map(([x, h]) => pine(x, h))}
      <path d="M0 70 Q180 38 360 62 T720 58 T1080 54 T1440 60" fill="none" stroke="#ffffff" strokeWidth={3} opacity={0.9} />
      <path
        className="garland-twinkle"
        d="M1060 10 l2.6 5.6 6 .6 -4.6 4 1.4 6 -5.4 -3.2 -5.4 3.2 1.4 -6 -4.6 -4 6 -.6z"
        fill="rgb(var(--c-gold-400))"
      />
    </>
  );
}

function NouvelAn() {
  const buildings: Array<[number, number, number]> = [];
  let x = 0;
  let i = 0;
  while (x < W) {
    const w = [40, 56, 34, 48, 62, 38, 44, 52, 36][i % 9]!;
    const h = [44, 62, 36, 78, 52, 30, 68, 48, 58, 40, 72, 34][i % 12]!;
    buildings.push([x, w, h]);
    x += w;
    i++;
  }
  return (
    <>
      <rect x={0} y={H - 12} width={W} height={12} fill={FILL} />
      {buildings.map(([bx, bw, bh], idx) => (
        <g key={idx}>
          <rect x={bx} y={H - bh} width={bw} height={bh} fill={FILL} />
          {Array.from({ length: Math.floor(bh / 14) }, (_, row) =>
            Array.from({ length: Math.floor(bw / 12) }, (_, col) =>
              (idx + row + col) % 3 === 0 ? (
                <rect
                  key={`${row}-${col}`}
                  x={bx + 5 + col * 12}
                  y={H - bh + 6 + row * 14}
                  width={4}
                  height={5}
                  fill="rgb(var(--c-gold-300))"
                  opacity={0.85}
                />
              ) : null
            )
          )}
        </g>
      ))}
    </>
  );
}

function Paques() {
  const colors = ["#f6c6d6", "#f8e08e", "#c9b8ec", "#a8d8f0", "#bfe3c0", "#f7b98b"];
  const eggs = [80, 230, 395, 520, 690, 840, 985, 1130, 1270, 1390].map((x, i) => [x, colors[i % colors.length]!] as const);
  const blades = Array.from({ length: 160 }, (_, i) => {
    const bx = i * 9;
    const bh = 14 + ((i * 7) % 16);
    return `M${bx} ${H - 18} L${bx + 4} ${H - 18 - bh} L${bx + 8} ${H - 18} Z`;
  }).join(" ");
  return (
    <>
      <path d={blades} fill="rgb(var(--c-gold-500))" />
      <rect x={0} y={H - 20} width={W} height={20} fill={FILL} />
      {eggs.map(([ex, color], i) => (
        <g key={ex} transform={`rotate(${(i % 3) * 8 - 8} ${ex} ${H - 32})`}>
          <ellipse cx={ex} cy={H - 34} rx={12} ry={16} fill={color} />
          <path d={`M${ex - 12} ${H - 37} q6 -5 12 0 t12 0`} fill="none" stroke="#ffffff" strokeWidth={2.2} />
          <path d={`M${ex - 11} ${H - 28} l4 -3 4 3 4 -3 4 3 4 -3`} fill="none" stroke="#ffffff" strokeWidth={1.6} opacity={0.8} />
        </g>
      ))}
    </>
  );
}

function SaintValentin() {
  const hearts = [90, 300, 520, 700, 930, 1130, 1360];
  return (
    <>
      <path d={`M0 60 Q120 40 240 60 T480 60 T720 60 T960 60 T1200 60 T1440 60 V${H} H0 Z`} fill={FILL} />
      {hearts.map((hx, i) => {
        const s = 0.7 + (i % 3) * 0.25;
        const y = 6 + (i % 2) * 12;
        return (
          // La position est sur le <g> : l'animation CSS (transform) du
          // <path> écraserait sinon son attribut transform.
          <g key={hx} transform={`translate(${hx} ${y}) scale(${s * 1.6})`}>
            <path
              className="garland-pulse"
              style={{ ["--garland-delay" as string]: `${i * 0.3}s` }}
              fill={i % 2 ? "rgb(var(--c-wine-300))" : "rgb(var(--c-wine-400))"}
              d="M0 16 C-11 8 -9 -1 -4 0 C-1.5 .5 0 3 0 3 C0 3 1.5 .5 4 0 C9 -1 11 8 0 16 Z"
            />
          </g>
        );
      })}
    </>
  );
}

const SCENES: Partial<Record<SiteTheme, () => React.ReactElement>> = {
  NOEL: Noel,
  NOUVEL_AN: NouvelAn,
  PAQUES: Paques,
  SAINT_VALENTIN: SaintValentin,
};

export function SeasonalFooterDecor({ theme }: { theme: SiteTheme }) {
  const Scene = SCENES[theme];
  if (!Scene) return null;
  return (
    <div aria-hidden className="pointer-events-none -mb-px">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMax slice"
        className="block h-[70px] w-full sm:h-[90px]"
      >
        <Scene />
      </svg>
    </div>
  );
}
