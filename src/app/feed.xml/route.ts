import { prisma } from "@/lib/db/prisma";
import { absoluteUrl } from "@/lib/seo";
import { getSiteSettings } from "@/lib/services/settings.service";

export const dynamic = "force-dynamic";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export async function GET() {
  const [settings, articles] = await Promise.all([
    getSiteSettings(),
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      include: { mainImage: true, category: true },
      orderBy: { publishedAt: "desc" },
      take: 30,
    }),
  ]);

  const siteUrl = absoluteUrl("/");
  const feedUrl = absoluteUrl("/feed.xml");
  const lastBuildDate = (articles[0]?.publishedAt ?? new Date()).toUTCString();

  const items = articles
    .map((article) => {
      const url = absoluteUrl(`/actualites/${article.slug}`);
      const description = article.excerpt || stripHtml(article.content).slice(0, 400);
      return `
    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(description)}</description>
      ${article.category ? `<category>${escapeXml(article.category.name)}</category>` : ""}
      ${article.publishedAt ? `<pubDate>${article.publishedAt.toUTCString()}</pubDate>` : ""}
      ${article.mainImage ? `<enclosure url="${escapeXml(article.mainImage.url)}" type="image/jpeg" />` : ""}
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(settings.siteName)} — Actualités</title>
    <link>${siteUrl}</link>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
    <description>${escapeXml(settings.seoDefaultDescription || settings.siteDescription || "Actualités de l'association " + settings.siteName)}</description>
    <language>fr-fr</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
