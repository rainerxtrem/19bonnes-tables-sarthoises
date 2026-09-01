import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const [restaurants, pages, articles, albums] = await Promise.all([
    prisma.restaurant.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
    prisma.page.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
    prisma.article.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
    prisma.galleryAlbum.findMany({ select: { slug: true, updatedAt: true } }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/le-bureau`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/partenaires`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/galerie`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/actualites`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/contact`, changeFrequency: "yearly", priority: 0.4 },
  ];

  return [
    ...staticRoutes,
    ...restaurants.map((r) => ({ url: `${baseUrl}/${r.slug}`, lastModified: r.updatedAt, changeFrequency: "monthly" as const, priority: 0.8 })),
    ...pages.map((p) => ({ url: `${baseUrl}/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "monthly" as const, priority: 0.6 })),
    ...articles.map((a) => ({ url: `${baseUrl}/actualites/${a.slug}`, lastModified: a.updatedAt, changeFrequency: "monthly" as const, priority: 0.5 })),
    ...albums.map((g) => ({ url: `${baseUrl}/galerie/${g.slug}`, lastModified: g.updatedAt, changeFrequency: "monthly" as const, priority: 0.4 })),
  ];
}
