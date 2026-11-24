/**
 * Palettes des thèmes du site public (Normal + thèmes saisonniers).
 *
 * Source de vérité unique : tailwind.config.ts transforme ces palettes en
 * variables CSS (`:root` = thème Normal, `[data-theme="..."]` = thèmes
 * saisonniers). Les classes Tailwind existantes (wine-700, gold-400,
 * cream-100, ink-900...) restent donc identiques partout : seul le contenu
 * des variables change selon le thème actif. L'admin n'est jamais thémé
 * (l'attribut data-theme n'est posé que sur le layout public).
 *
 * Fichier sans alias `@/` : il est importé par tailwind.config.ts.
 */

type Shade = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
type Scale = Record<Shade, string>;

export interface ThemePalette {
  ink: Scale & { 950: string };
  gold: Scale;
  wine: Scale;
  cream: Record<50 | 100 | 200 | 300, string>;
}

const NORMAL: ThemePalette = {
  ink: {
    50: "#f6f5f3",
    100: "#e9e6e1",
    200: "#d3cdc3",
    300: "#b3a99a",
    400: "#8f8271",
    500: "#6f6455",
    600: "#564d41",
    700: "#443c33",
    800: "#332c26",
    900: "#231e1a",
    950: "#17130f",
  },
  gold: {
    50: "#fbf7ec",
    100: "#f5ecd0",
    200: "#ead79f",
    300: "#dcbb6c",
    400: "#cda047",
    500: "#b8863a",
    600: "#996b2d",
    700: "#7a5326",
    800: "#644423",
    900: "#54391f",
  },
  wine: {
    50: "#fbf1f1",
    100: "#f4dcdd",
    200: "#e8b9bb",
    300: "#d68a8d",
    400: "#bd5c60",
    500: "#9c3a3e",
    600: "#7d2b2f",
    700: "#642227",
    800: "#521e22",
    900: "#461c1f",
  },
  cream: {
    50: "#fffdf9",
    100: "#faf6ee",
    200: "#f3ecdb",
    300: "#e9ddc1",
  },
};

/** Noël : rouge houx, or, vert sapin, fond "neige". */
const NOEL: ThemePalette = {
  ink: {
    50: "#f2f6f3",
    100: "#dfe9e2",
    200: "#c0d3c6",
    300: "#95b3a0",
    400: "#6a8f78",
    500: "#4d725c",
    600: "#3b5a48",
    700: "#2f493a",
    800: "#253a2e",
    900: "#1b2c23",
    950: "#111d17",
  },
  gold: NORMAL.gold,
  wine: {
    50: "#fdf2f2",
    100: "#fbe0e0",
    200: "#f5bcbc",
    300: "#ec8c8c",
    400: "#df5a5a",
    500: "#c73236",
    600: "#a8232a",
    700: "#8b1c22",
    800: "#721a1f",
    900: "#5e191d",
  },
  cream: {
    50: "#ffffff",
    100: "#f7f9f8",
    200: "#eaf0ed",
    300: "#d9e4de",
  },
};

/** Nouvel an : bleu nuit et champagne. */
const NOUVEL_AN: ThemePalette = {
  ink: {
    50: "#f4f5f9",
    100: "#e3e6ef",
    200: "#c7cde0",
    300: "#9ea8c6",
    400: "#7380a6",
    500: "#56628a",
    600: "#434d70",
    700: "#363e5b",
    800: "#2a3048",
    900: "#1c2136",
    950: "#11142a",
  },
  gold: {
    50: "#fcf9ef",
    100: "#f8efd3",
    200: "#f0dea6",
    300: "#e6c873",
    400: "#d9b04b",
    500: "#c4973a",
    600: "#a2782e",
    700: "#805d27",
    800: "#664a23",
    900: "#533d1f",
  },
  wine: {
    50: "#f0f3fb",
    100: "#dde4f6",
    200: "#bac8ec",
    300: "#8ea3dd",
    400: "#5f78c8",
    500: "#3f58ae",
    600: "#2f4490",
    700: "#263775",
    800: "#202e5f",
    900: "#1c284f",
  },
  cream: {
    50: "#fffefb",
    100: "#fbf8f1",
    200: "#f3ede0",
    300: "#e7dec9",
  },
};

/** Pâques : lavande, vert printemps, fond pastel. */
const PAQUES: ThemePalette = {
  ink: NORMAL.ink,
  gold: {
    50: "#f3f9ef",
    100: "#e2f1d9",
    200: "#c6e3b4",
    300: "#a1cf86",
    400: "#7fb85f",
    500: "#619c43",
    600: "#4b7d33",
    700: "#3c622b",
    800: "#324f26",
    900: "#2b4222",
  },
  wine: {
    50: "#f7f4fb",
    100: "#ede6f6",
    200: "#dccdee",
    300: "#c2a8e0",
    400: "#a27fcd",
    500: "#865eb6",
    600: "#6f4a99",
    700: "#5c3d7e",
    800: "#4c3467",
    900: "#3f2d55",
  },
  cream: {
    50: "#fffefa",
    100: "#fdfaee",
    200: "#f8f1d8",
    300: "#f0e4b8",
  },
};

/** Saint-Valentin : framboise, or rose, fond poudré. */
const SAINT_VALENTIN: ThemePalette = {
  ink: NORMAL.ink,
  gold: {
    50: "#fcf5f2",
    100: "#f8e6df",
    200: "#f0cbbd",
    300: "#e5a993",
    400: "#d6866b",
    500: "#c26a50",
    600: "#a45541",
    700: "#864537",
    800: "#6e3a30",
    900: "#5c322a",
  },
  wine: {
    50: "#fdf2f5",
    100: "#fce4ea",
    200: "#f9c9d6",
    300: "#f3a0b6",
    400: "#e96b8e",
    500: "#d9416c",
    600: "#be2b55",
    700: "#9f2146",
    800: "#851e3e",
    900: "#711d39",
  },
  cream: {
    50: "#fffbfb",
    100: "#fdf4f3",
    200: "#f9e5e4",
    300: "#f2d1cf",
  },
};

/** Clé = valeur de l'enum Prisma `SiteTheme`. */
export const THEME_PALETTES = {
  NORMAL,
  NOEL,
  NOUVEL_AN,
  PAQUES,
  SAINT_VALENTIN,
} satisfies Record<string, ThemePalette>;

export type ThemeKey = keyof typeof THEME_PALETTES;

/** Valeur de l'attribut `data-theme` (ex. NOUVEL_AN -> "nouvel-an"). */
export function themeAttribute(key: ThemeKey): string {
  return key.toLowerCase().replace(/_/g, "-");
}

function hexToChannels(hex: string): string {
  const value = hex.replace("#", "");
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `${r} ${g} ${b}`;
}

/** Variables CSS d'une palette : `--c-wine-600: 125 43 47`, etc. */
export function paletteToCssVars(palette: ThemePalette): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const [name, scale] of Object.entries(palette)) {
    for (const [shade, hex] of Object.entries(scale as Record<string, string>)) {
      vars[`--c-${name}-${shade}`] = hexToChannels(hex);
    }
  }
  return vars;
}

/** Échelle Tailwind pointant vers les variables (opacité `/60` supportée). */
export function cssVarScale(name: keyof ThemePalette): Record<string, string> {
  const scale: Record<string, string> = {};
  for (const shade of Object.keys(NORMAL[name])) {
    scale[shade] = `rgb(var(--c-${name}-${shade}) / <alpha-value>)`;
  }
  return scale;
}
