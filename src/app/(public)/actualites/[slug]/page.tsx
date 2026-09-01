import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/db/prisma";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

async function getArticle(slug: string) {
  const article = await prisma.article.findUnique({
    where: { slug },
    include: { mainImage: true, ogImage: true, category: true, author: { select: { name: true } } },
  });
  if (!article || article.status !== "PUBLISHED") return null;
  return article;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return {};
  return {
    title: article.seoTitle || article.title,
    description: article.seoDescription || article.excerpt || undefined,
    openGraph: article.ogImage || article.mainImage
      ? { images: [{ url: (article.ogImage ?? article.mainImage)!.url }] }
      : undefined,
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  return (
    <article className="container py-16">
      <div className="mx-auto max-w-3xl">
        {article.publishedAt ? (
          <p className="text-center text-xs uppercase tracking-wide text-gray-400">
            {format(article.publishedAt, "d MMMM yyyy", { locale: fr })}
            {article.category ? ` · ${article.category.name}` : ""}
          </p>
        ) : null}
        <h1 className="mt-2 text-center text-3xl font-semibold text-brand-dark">{article.title}</h1>
        {article.mainImage ? (
          <div className="relative mt-8 aspect-video overflow-hidden rounded-lg">
            <Image src={article.mainImage.url} alt={article.mainImage.alt ?? article.title} fill className="object-cover" />
          </div>
        ) : null}
        <div className="prose prose-sm mx-auto mt-8 max-w-none" dangerouslySetInnerHTML={{ __html: article.content }} />
        {article.tags.length > 0 ? (
          <div className="mt-8 flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-brand-cream px-3 py-1 text-xs text-brand-dark">
                #{tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}
