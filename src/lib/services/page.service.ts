import { prisma } from "@/lib/db/prisma";
import { ensureUniqueSlug, slugifyText } from "@/lib/slug";
import type { PageInput } from "@/lib/validation/page";

export async function listPagesAdmin() {
  return prisma.page.findMany({ orderBy: { updatedAt: "desc" } });
}

export async function getPageById(id: string) {
  return prisma.page.findUnique({ where: { id }, include: { mainImage: true, ogImage: true } });
}

function emptyToNull(value?: string | null) {
  return value === "" || value === undefined ? null : value;
}

export async function createPage(input: PageInput) {
  const slug = await ensureUniqueSlug("page", input.slug || input.title);
  return prisma.page.create({
    data: {
      ...input,
      slug,
      excerpt: emptyToNull(input.excerpt),
      seoTitle: emptyToNull(input.seoTitle),
      seoDescription: emptyToNull(input.seoDescription),
      publishedAt: input.status === "PUBLISHED" ? new Date() : null,
    },
  });
}

export async function updatePage(id: string, input: PageInput) {
  const existing = await prisma.page.findUniqueOrThrow({ where: { id } });
  const slug =
    input.slug && slugifyText(input.slug) !== existing.slug
      ? await ensureUniqueSlug("page", input.slug, id)
      : existing.slug;

  return prisma.page.update({
    where: { id },
    data: {
      ...input,
      slug,
      excerpt: emptyToNull(input.excerpt),
      seoTitle: emptyToNull(input.seoTitle),
      seoDescription: emptyToNull(input.seoDescription),
      publishedAt:
        input.status === "PUBLISHED" && existing.status !== "PUBLISHED"
          ? new Date()
          : input.status === "PUBLISHED"
            ? existing.publishedAt
            : null,
    },
  });
}

export async function deletePage(id: string) {
  const page = await prisma.page.findUniqueOrThrow({ where: { id } });
  if (page.isSystem) {
    throw new Error("Cette page système ne peut pas être supprimée.");
  }
  return prisma.page.delete({ where: { id } });
}
