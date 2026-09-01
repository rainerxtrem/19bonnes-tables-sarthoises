import slugify from "slugify";
import { prisma } from "@/lib/db/prisma";

export function slugifyText(input: string): string {
  // Les apostrophes (droites ou typographiques) doivent séparer les mots
  // ("L'Insouciant" -> "l-insouciant"), sinon `slugify` les supprime et
  // colle les mots ensemble ("linsouciant").
  const withoutApostrophes = input.replace(/['’]/g, " ");
  return slugify(withoutApostrophes, { lower: true, strict: true, locale: "fr" });
}

type SlugModel = "restaurant" | "page" | "article" | "galleryAlbum";

/**
 * Garantit l'unicité d'un slug pour un modèle donné en ajoutant un suffixe
 * numérique (-2, -3, ...) en cas de collision. `excludeId` permet d'exclure
 * l'enregistrement courant lors d'une modification.
 */
export async function ensureUniqueSlug(
  model: SlugModel,
  base: string,
  excludeId?: string
): Promise<string> {
  const baseSlug = slugifyText(base) || "sans-titre";
  let candidate = baseSlug;
  let attempt = 1;

  // Restaurant et Page partagent le même espace de routage public (/[slug]),
  // leurs slugs doivent donc être uniques tous modèles confondus.
  while (await slugExists(model, candidate, excludeId)) {
    attempt += 1;
    candidate = `${baseSlug}-${attempt}`;
  }

  return candidate;
}

async function slugExists(model: SlugModel, slug: string, excludeId?: string): Promise<boolean> {
  if (model === "restaurant" || model === "page") {
    const [restaurant, page] = await Promise.all([
      prisma.restaurant.findUnique({ where: { slug }, select: { id: true } }),
      prisma.page.findUnique({ where: { slug }, select: { id: true } }),
    ]);
    if (restaurant && restaurant.id !== excludeId) return true;
    if (page && page.id !== excludeId) return true;
    return false;
  }

  if (model === "article") {
    const article = await prisma.article.findUnique({ where: { slug }, select: { id: true } });
    return Boolean(article && article.id !== excludeId);
  }

  const album = await prisma.galleryAlbum.findUnique({ where: { slug }, select: { id: true } });
  return Boolean(album && album.id !== excludeId);
}
