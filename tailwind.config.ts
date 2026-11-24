import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";
import { THEME_PALETTES, cssVarScale, paletteToCssVars, themeAttribute, type ThemeKey } from "./src/lib/themes/palettes";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Les couleurs pointent vers des variables CSS (voir
        // src/lib/themes/palettes.ts) pour permettre les thèmes saisonniers
        // du site public sans toucher aux classes utilisées partout.
        // Alias historiques conservés (utilisés aussi dans /admin).
        brand: {
          dark: "rgb(var(--c-ink-900) / <alpha-value>)",
          DEFAULT: "rgb(var(--c-wine-600) / <alpha-value>)",
          light: "rgb(var(--c-gold-400) / <alpha-value>)",
          cream: "rgb(var(--c-cream-100) / <alpha-value>)",
        },
        ink: cssVarScale("ink"),
        gold: cssVarScale("gold"),
        wine: cssVarScale("wine"),
        cream: { DEFAULT: "rgb(var(--c-cream-100) / <alpha-value>)", ...cssVarScale("cream") },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-fraunces)", "Georgia", "serif"],
      },
      maxWidth: {
        prose: "68ch",
      },
      boxShadow: {
        card: "0 10px 30px -14px rgba(23, 19, 15, 0.25)",
        elevated: "0 24px 70px -20px rgba(23, 19, 15, 0.35)",
      },
      backgroundImage: {
        "grain": "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E\")",
      },
      container: {
        center: true,
        padding: "1.25rem",
        screens: {
          xl: "1200px",
        },
      },
      transitionTimingFunction: {
        editorial: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    // :root = thème Normal (admin + site public par défaut) ; chaque thème
    // saisonnier redéfinit les variables sous [data-theme="..."].
    plugin(({ addBase }) => {
      const { NORMAL, ...seasonal } = THEME_PALETTES;
      addBase({ ":root": paletteToCssVars(NORMAL) });
      for (const [key, palette] of Object.entries(seasonal)) {
        addBase({ [`[data-theme="${themeAttribute(key as ThemeKey)}"]`]: paletteToCssVars(palette) });
      }
    }),
  ],
};

export default config;
