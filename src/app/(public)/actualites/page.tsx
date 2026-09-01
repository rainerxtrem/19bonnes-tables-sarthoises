import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Reveal } from "@/components/public/reveal";
import { ArticleCover } from "@/components/public/article-cover";
import { ArrowRight, ArrowUpRight } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Actualités" };

export default async function ActualitesIndexPage() {
  const articles = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    include: { mainImage: true, category: true },
    orderBy: { publishedAt: "desc" },
  });

  const [featured, ...rest] = articles;

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
          <Reveal delay={160}>
            <p className="mx-auto mt-5 max-w-xl text-ink-600">
              Recettes de terroir, vie de l&apos;association, distinctions de nos membres : suivez ce qui se passe
              du côté des 19 Bonnes Tables Sarthoises.
            </p>
          </Reveal>
        </div>
      </section>

      {!featured ? (
        <section className="py-24">
          <div className="container text-center">
            <p className="text-sm text-ink-500">Aucune actualité publiée pour le moment. Revenez bientôt.</p>
          </div>
        </section>
      ) : (
        <>
          {/* Article à la une : légèrement mis en avant pour éviter l'effet
              "grille clairsemée" tant qu'il y a peu d'articles, sans pour
              autant écraser la page. */}
          <section className="py-12 sm:py-16">
            <div className="container">
              <Reveal className="mx-auto max-w-3xl">
                <Link
                  href={`/actualites/${featured.slug}`}
                  className="group grid grid-cols-1 overflow-hidden rounded-md bg-cream-50 shadow-elevated sm:grid-cols-5"
                >
                  <ArticleCover
                    url={featured.mainImage?.url ?? null}
                    alt={featured.mainImage?.alt}
                    title={featured.title}
                    category={featured.category?.name}
                    className="relative aspect-[16/10] overflow-hidden bg-ink-100 sm:col-span-2 sm:aspect-auto"
                  />
                  <div className="flex flex-col justify-center p-6 sm:col-span-3 sm:p-8">
                    <p className="eyebrow">À la une</p>
                    {featured.publishedAt ? (
                      <p className="mt-3 text-xs uppercase tracking-wide text-ink-400">
                        {format(featured.publishedAt, "d MMMM yyyy", { locale: fr })}
                        {featured.category ? ` · ${featured.category.name}` : ""}
                      </p>
                    ) : null}
                    <h2 className="mt-2 font-display text-2xl text-ink-900 sm:text-3xl">{featured.title}</h2>
                    {featured.excerpt ? (
                      <p className="mt-3 text-sm text-ink-600">{featured.excerpt}</p>
                    ) : null}
                    <span className="link-sweep mt-5 inline-flex w-fit items-center gap-1.5 text-sm font-medium text-wine-700">
                      Lire l&apos;article
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
                    </span>
                  </div>
                </Link>
              </Reveal>
            </div>
          </section>

          {rest.length > 0 ? (
            <section className="border-t border-ink-900/10 bg-cream-100 py-16 sm:py-20">
              <div className="container">
                <Reveal>
                  <p className="eyebrow">Aussi à lire</p>
                </Reveal>
                <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((article, index) => (
                    <Reveal key={article.id} delay={(index % 3) * 100}>
                      <Link
                        href={`/actualites/${article.slug}`}
                        className="group block h-full overflow-hidden rounded-md bg-cream-50 shadow-card transition-all duration-500 ease-editorial hover:-translate-y-1 hover:shadow-elevated"
                      >
                        <ArticleCover
                          url={article.mainImage?.url ?? null}
                          alt={article.mainImage?.alt}
                          title={article.title}
                          category={article.category?.name}
                          className="relative aspect-[4/3] overflow-hidden bg-ink-100"
                        />
                        <div className="p-6">
                          {article.publishedAt ? (
                            <p className="text-xs uppercase tracking-wide text-gold-600">
                              {format(article.publishedAt, "d MMMM yyyy", { locale: fr })}
                              {article.category ? ` · ${article.category.name}` : ""}
                            </p>
                          ) : null}
                          <h3 className="mt-2 font-display text-xl text-ink-900">{article.title}</h3>
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
              </div>
            </section>
          ) : null}

          {/* Passerelle vers le reste du site : évite une fin de page abrupte
              quand il n'y a qu'un ou deux articles. */}
          <section className="border-t border-ink-900/10 py-20 text-center">
            <div className="container">
              <Reveal>
                <p className="eyebrow justify-center">En attendant la suite</p>
              </Reveal>
              <Reveal delay={80}>
                <h2 className="mx-auto mt-4 max-w-xl font-display text-2xl text-ink-900 sm:text-3xl">
                  Partez à la découverte de nos restaurants membres
                </h2>
              </Reveal>
              <Reveal delay={140}>
                <Link href="/#restaurants" className="btn-cta mt-8">
                  Découvrir nos restaurants
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </Reveal>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
