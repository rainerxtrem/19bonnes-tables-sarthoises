import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ArticleCover } from "@/components/public/article-cover";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

function estimateReadingMinutes(html: string): number {
  const words = html
    .replace(/<[^>]*>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

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

  const otherArticle = await prisma.article.findFirst({
    where: { status: "PUBLISHED", slug: { not: article.slug } },
    include: { mainImage: true, category: true },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <article>
      <ArticleCover
        url={article.mainImage?.url ?? null}
        alt={article.mainImage?.alt}
        title={article.title}
        category={article.category?.name}
        className="relative h-[36vh] min-h-[280px] overflow-hidden bg-ink-950"
      />

      <div className="container">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/actualites"
            className="link-sweep mb-10 mt-8 inline-flex items-center gap-1.5 text-xs uppercase tracking-wide text-ink-500"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            Toutes les actualités
          </Link>

          {article.publishedAt ? (
            <p className="eyebrow justify-center">
              {format(article.publishedAt, "d MMMM yyyy", { locale: fr })}
              {article.category ? ` · ${article.category.name}` : ""}
              {` · ${estimateReadingMinutes(article.content)} min de lecture`}
            </p>
          ) : null}
          <h1 className="mt-3 text-center font-display text-4xl text-ink-900 sm:text-5xl">{article.title}</h1>
          {article.author?.name ? (
            <p className="mt-3 text-center text-sm text-ink-500">Par {article.author.name}</p>
          ) : null}

          <div className="mx-auto mt-10 h-px w-16 bg-gradient-to-r from-transparent via-gold-400 to-transparent" />

          <div
            className="prose prose-sm mx-auto mt-10 max-w-none pb-16 [&>p:first-of-type]:font-display [&>p:first-of-type]:text-base [&>p:first-of-type]:italic [&>p:first-of-type]:text-ink-700 [&_li::marker]:text-gold-600 [&_h2]:mt-12 [&_h3]:mt-8"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {article.tags.length > 0 ? (
            <div className="mb-16 flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-cream-200 px-3 py-1 text-xs text-ink-700">
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {/* Continuité de navigation : jamais de fin de page abrupte. */}
      <section className="border-t border-ink-900/10 bg-cream-100 py-16">
        <div className="container">
          <div className="mx-auto flex max-w-3xl flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
            <div>
              {otherArticle ? (
                <>
                  <p className="eyebrow justify-center sm:justify-start">À lire aussi</p>
                  <Link href={`/actualites/${otherArticle.slug}`} className="link-sweep mt-2 inline-block font-display text-xl text-ink-900">
                    {otherArticle.title}
                  </Link>
                </>
              ) : (
                <>
                  <p className="eyebrow justify-center sm:justify-start">Envie d&apos;en savoir plus ?</p>
                  <p className="mt-2 font-display text-xl text-ink-900">Découvrez les restaurants membres</p>
                </>
              )}
            </div>
            <Link
              href={otherArticle ? `/actualites/${otherArticle.slug}` : "/nos-restaurants"}
              className="btn-cta shrink-0"
            >
              {otherArticle ? "Lire" : "Découvrir"}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}
