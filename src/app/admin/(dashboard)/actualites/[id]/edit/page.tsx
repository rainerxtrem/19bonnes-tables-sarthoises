import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { getArticleById } from "@/lib/services/article.service";
import { ArticleForm } from "@/components/admin/article-form";

export const metadata = { title: "Modifier un article | Administration" };

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [article, categories] = await Promise.all([
    getArticleById(id),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!article) notFound();

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-gray-900">Modifier {article.title}</h1>
      <ArticleForm article={article} categories={categories} />
    </div>
  );
}
