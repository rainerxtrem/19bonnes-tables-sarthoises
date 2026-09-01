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
        // Palette provisoire neutre — à ajuster précisément après capture
        // visuelle du site B12 actuel (voir audit Phase 1, point 13).
        brand: {
          dark: "#0f1a12",
          DEFAULT: "#2f5233",
          light: "#c8a24a",
          cream: "#f7f4ee",
        },
      },
      fontFamily: {
        sans: ["var(--font-poppins)", "sans-serif"],
      },
      container: {
        center: true,
        padding: "1rem",
        screens: {
          xl: "1152px",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
