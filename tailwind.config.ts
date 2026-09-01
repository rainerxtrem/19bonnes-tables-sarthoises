import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Alias historiques conservés (utilisés partout, y compris dans
        // /admin) pour ne rien casser : ils pointent simplement vers la
        // nouvelle palette éditoriale ci-dessous.
        brand: {
          dark: "#211a15",
          DEFAULT: "#7d2b2f",
          light: "#cda047",
          cream: "#faf6ee",
        },
        // Palette éditoriale "guide gastronomique" : encre chaude, laiton/or
        // et vin, sur fond crème — voir la refonte design.
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
          DEFAULT: "#faf6ee",
          50: "#fffdf9",
          100: "#faf6ee",
          200: "#f3ecdb",
          300: "#e9ddc1",
        },
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
  plugins: [require("@tailwindcss/typography")],
};

export default config;
