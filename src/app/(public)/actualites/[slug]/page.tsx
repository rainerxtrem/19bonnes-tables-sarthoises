import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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
    <article className="py-16 sm:py-20">
      <div className="container">
        <div className="mx-auto max-w-3xl">
          <Link href="/actualites" className="link-sweep inline-flex items-center gap-1.5 text-xs uppercase tracking-wide text-ink-500">
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            Toutes les actualités
          </Link>
          {article.publishedAt ? (
            <p className="mt-8 text-center text-xs uppercase tracking-wide text-gold-600">
              {format(article.publishedAt, "d MMMM yyyy", { locale: fr })}
              {article.category ? ` · ${article.category.name}` : ""}
            </p>
          ) : null}
          <h1 className="mt-3 text-center font-display text-4xl text-ink-900">{article.title}</h1>
          {article.mainImage ? (
            <div className="relative mt-10 aspect-video overflow-hidden rounded-md shadow-card">
              <Image src={article.mainImage.url} alt={article.mainImage.alt ?? article.title} fill className="object-cover" />
            </div>
          ) : null}
          <div className="prose prose-sm mx-auto mt-10 max-w-none" dangerouslySetInnerHTML={{ __html: article.content }} />
          {article.tags.length > 0 ? (
            <div className="mt-10 flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-cream-200 px-3 py-1 text-xs text-ink-700">
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
