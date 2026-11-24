import type { SiteTheme } from "@prisma/client";
import { THEME_PALETTES, themeAttribute } from "./palettes";

export { themeAttribute };

export interface ThemeOption {
  key: SiteTheme;
  label: string;
  description: string;
  /** Exemple de texte de bandeau, proposé en placeholder dans l'admin. */
  bannerExample: string;
  /** Couleurs affichées en pastilles dans l'admin. */
  swatches: string[];
}

function swatchesOf(key: SiteTheme) {
  const p = THEME_PALETTES[key];
  return [p.wine[700], p.gold[400], p.ink[900], p.cream[200]];
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    key: "NORMAL",
    label: "Normal",
    description: "Le site actuel : vin, or et crème.",
    bannerExample: "",
    swatches: swatchesOf("NORMAL"),
  },
  {
    key: "NOEL",
    label: "Noël",
    description: "Rouge houx, vert sapin et chute de neige.",
    bannerExample: "Joyeuses fêtes ! Offrez un bon cadeau gourmand à vos proches.",
    swatches: swatchesOf("NOEL"),
  },
  {
    key: "NOUVEL_AN",
    label: "Nouvel an",
    description: "Bleu nuit, champagne et confettis.",
    bannerExample: "Belle et gourmande année à toutes et à tous !",
    swatches: swatchesOf("NOUVEL_AN"),
  },
  {
    key: "PAQUES",
    label: "Pâques",
    description: "Lavande, vert printemps et pétales.",
    bannerExample: "Joyeuses Pâques ! Découvrez les menus de printemps de nos tables.",
    swatches: swatchesOf("PAQUES"),
  },
  {
    key: "SAINT_VALENTIN",
    label: "St Valentin",
    description: "Framboise, or rose et petits cœurs.",
    bannerExample: "Saint-Valentin : réservez un dîner en amoureux dans l'une de nos tables.",
    swatches: swatchesOf("SAINT_VALENTIN"),
  },
];

/** Thème réellement affiché sur le site public. */
export function resolveActiveTheme(settings: { themeEnabled: boolean; siteTheme: SiteTheme }): SiteTheme {
  return settings.themeEnabled ? settings.siteTheme : "NORMAL";
}
