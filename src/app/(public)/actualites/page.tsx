import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db/prisma";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Actualités" };

export default async function ActualitesIndexPage() {
  const articles = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    include: { mainImage: true, category: true },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="container py-16">
      <h1 className="mb-10 text-center text-3xl font-semibold text-brand-dark">Actualités</h1>

      {articles.length === 0 ? (
        <p className="text-center text-sm text-gray-500">Aucune actualité publiée pour le moment.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/actualites/${article.slug}`}
              className="group overflow-hidden rounded-lg bg-white shadow-sm hover:shadow-lg"
            >
              <div className="relative aspect-[4/3] bg-gray-100">
                {article.mainImage ? (
                  <Image src={article.mainImage.url} alt={article.mainImage.alt ?? article.title} fill className="object-cover transition-transform group-hover:scale-105" />
                ) : null}
              </div>
              <div className="p-5">
                {article.publishedAt ? (
                  <p className="text-xs uppercase tracking-wide text-gray-400">
                    {format(article.publishedAt, "d MMMM yyyy", { locale: fr })}
                    {article.category ? ` · ${article.category.name}` : ""}
                  </p>
                ) : null}
                <h2 className="mt-1 font-semibold text-brand-dark">{article.title}</h2>
                {article.excerpt ? <p className="mt-2 text-sm text-gray-600">{article.excerpt}</p> : null}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
