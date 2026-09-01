import Image from "next/image";
import { Newspaper } from "lucide-react";

/**
 * Couverture d'article : la vraie image si elle existe, sinon un fond
 * éditorial travaillé (dégradé + motif + monogramme) plutôt qu'un bloc gris
 * vide — évite l'effet "page inachevée" tant que peu d'articles ont une
 * photo.
 */
export function ArticleCover({
  url,
  alt,
  title,
  category,
  className,
}: {
  url: string | null;
  alt?: string | null;
  title: string;
  category?: string | null;
  className?: string;
}) {
  if (url) {
    return (
      <div className={className}>
        <Image src={url} alt={alt ?? title} fill className="object-cover" />
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="absolute inset-0 bg-gradient-to-br from-ink-950 via-wine-800 to-ink-900" />
      <div className="pointer-events-none absolute inset-0 bg-grain opacity-60" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
        <Newspaper className="h-8 w-8 text-gold-300/80" aria-hidden />
        <p className="eyebrow text-gold-300 before:bg-gold-300">{category ?? "Vie de l'association"}</p>
      </div>
    </div>
  );
}
