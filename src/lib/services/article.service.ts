import { prisma } from "@/lib/db/prisma";
import { ensureUniqueSlug, slugifyText } from "@/lib/slug";
import type { ArticleInput } from "@/lib/validation/article";

export async function listArticlesAdmin() {
  return prisma.article.findMany({
    include: { mainImage: true, category: true },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getArticleById(id: string) {
  return prisma.article.findUnique({ where: { id }, include: { mainImage: true } });
}

function emptyToNull(value?: string | null) {
  return value === "" || value === undefined ? null : value;
}

export async function createArticle(input: ArticleInput, authorId: string) {
  const slug = await ensureUniqueSlug("article", input.slug || input.title);
  return prisma.article.create({
    data: {
      ...input,
      slug,
      excerpt: emptyToNull(input.excerpt),
      seoTitle: emptyToNull(input.seoTitle),
      seoDescription: emptyToNull(input.seoDescription),
      categoryId: input.categoryId || null,
      authorId,
      publishedAt: input.status === "PUBLISHED" ? new Date() : null,
    },
  });
}

export async function updateArticle(id: string, input: ArticleInput) {
  const existing = await prisma.article.findUniqueOrThrow({ where: { id } });
  const slug =
    input.slug && slugifyText(input.slug) !== existing.slug
      ? await ensureUniqueSlug("article", input.slug, id)
      : existing.slug;

  return prisma.article.update({
    where: { id },
    data: {
      ...input,
      slug,
      excerpt: emptyToNull(input.excerpt),
      seoTitle: emptyToNull(input.seoTitle),
      seoDescription: emptyToNull(input.seoDescription),
      categoryId: input.categoryId || null,
      publishedAt:
        input.status === "PUBLISHED" && existing.status !== "PUBLISHED"
          ? new Date()
          : input.status === "PUBLISHED"
            ? existing.publishedAt
            : null,
    },
  });
}

export async function deleteArticle(id: string) {
  return prisma.article.delete({ where: { id } });
}
