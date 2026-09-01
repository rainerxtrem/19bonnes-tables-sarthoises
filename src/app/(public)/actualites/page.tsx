import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db/prisma";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Reveal } from "@/components/public/reveal";
import { ArrowUpRight } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Actualités" };

export default async function ActualitesIndexPage() {
  const articles = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    include: { mainImage: true, category: true },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div>
      <section className="border-b border-ink-900/10 bg-cream-100 py-20 sm:py-28">
        <div className="container text-center">
          <Reveal>
            <p className="eyebrow justify-center">Vie de l&apos;association</p>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mx-auto mt-4 max-w-2xl font-display text-4xl text-ink-900 sm:text-5xl">Actualités</h1>
          </Reveal>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container">
          {articles.length === 0 ? (
            <p className="text-center text-sm text-ink-500">Aucune actualité publiée pour le moment.</p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((article, index) => (
                <Reveal key={article.id} delay={(index % 3) * 100}>
                  <Link
                    href={`/actualites/${article.slug}`}
                    className="group block h-full overflow-hidden rounded-md bg-cream-50 shadow-card transition-all duration-500 ease-editorial hover:-translate-y-1 hover:shadow-elevated"
                  >
                    <div className="relative aspect-[4/3] bg-ink-100">
                      {article.mainImage ? (
                        <Image
                          src={article.mainImage.url}
                          alt={article.mainImage.alt ?? article.title}
                          fill
                          className="object-cover transition-transform duration-700 ease-editorial group-hover:scale-[1.06]"
                        />
                      ) : null}
                    </div>
                    <div className="p-6">
                      {article.publishedAt ? (
                        <p className="text-xs uppercase tracking-wide text-gold-600">
                          {format(article.publishedAt, "d MMMM yyyy", { locale: fr })}
                          {article.category ? ` · ${article.category.name}` : ""}
                        </p>
                      ) : null}
                      <h2 className="mt-2 font-display text-xl text-ink-900">{article.title}</h2>
                      {article.excerpt ? <p className="mt-2 text-sm text-ink-600">{article.excerpt}</p> : null}
                      <span className="link-sweep mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-wine-700">
                        Lire l&apos;article
                        <ArrowUpRight className="h-4 w-4" aria-hidden />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
