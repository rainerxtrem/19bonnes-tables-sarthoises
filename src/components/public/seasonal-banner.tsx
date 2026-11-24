import { Egg, Heart, Sparkles, TreePine } from "lucide-react";
import type { SiteTheme } from "@prisma/client";

const ICONS: Partial<Record<SiteTheme, typeof Heart>> = {
  NOEL: TreePine,
  NOUVEL_AN: Sparkles,
  PAQUES: Egg,
  SAINT_VALENTIN: Heart,
};

/** Bandeau de message saisonnier au-dessus du header (texte défini dans /admin/settings). */
export function SeasonalBanner({ theme, text }: { theme: SiteTheme; text: string }) {
  const Icon = ICONS[theme] ?? Sparkles;
  return (
    <div className="relative z-40 bg-wine-700 text-cream-50">
      <p className="container flex items-center justify-center gap-2 py-2 text-center text-xs font-medium tracking-wide sm:text-sm">
        <Icon className="h-4 w-4 shrink-0 text-gold-300" aria-hidden />
        <span>{text}</span>
        <Icon className="hidden h-4 w-4 shrink-0 text-gold-300 sm:block" aria-hidden />
      </p>
    </div>
  );
}
