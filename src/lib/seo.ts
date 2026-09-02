import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "19 Bonnes Tables Sarthoises";

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}

/**
 * Construit un objet Metadata cohérent (titre, description, canonical,
 * Open Graph, Twitter Card) pour une page publique. Centralisé ici pour que
 * chaque page du site respecte le même socle SEO plutôt que de le
 * réécrire à la main à chaque fois (et risquer d'en oublier un bout).
 */
export function buildMetadata({
  title,
  description,
  path,
  image,
  type = "website",
  publishedTime,
  modifiedTime,
  titleIsAbsolute = false,
}: {
  title: string;
  description?: string | null;
  /** Chemin absolu depuis la racine, ex. "/le-bureau" ou "/". */
  path: string;
  image?: string | null;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  /** true uniquement pour la page d'accueil : évite que le gabarit "%s |
   * Nom du site" du layout racine ne duplique le nom du site dans le titre
   * (ex. "19 Bonnes Tables Sarthoises | 19 Bonnes Tables Sarthoises"). */
  titleIsAbsolute?: boolean;
}): Metadata {
  const url = absoluteUrl(path);
  const desc = description || undefined;

  return {
    title: titleIsAbsolute ? { absolute: title } : title,
    description: desc,
    // `alternates` n'est pas fusionné en profondeur avec celui du layout
    // parent (le plus spécifique remplace tout l'objet) — on inclut donc le
    // flux RSS ici pour qu'il reste découvrable sur chaque page, pas
    // seulement celles qui ne définissent pas leur propre canonical.
    alternates: { canonical: url, types: { "application/rss+xml": absoluteUrl("/feed.xml") } },
    openGraph: {
      title,
      description: desc,
      url,
      siteName: SITE_NAME,
      type,
      locale: "fr_FR",
      images: image ? [{ url: image }] : undefined,
      ...(type === "article" ? { publishedTime, modifiedTime } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description: desc,
      images: image ? [image] : undefined,
    },
  };
}

/** JSON-LD BreadcrumbList — aide Google à afficher un fil d'Ariane dans les
 * résultats de recherche plutôt que la seule URL brute. */
export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
