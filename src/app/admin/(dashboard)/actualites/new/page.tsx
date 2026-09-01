import { prisma } from "@/lib/db/prisma";
import { ArticleForm } from "@/components/admin/article-form";

export const metadata = { title: "Nouvel article | Administration" };

export default async function NewArticlePage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-gray-900">Nouvel article</h1>
      <ArticleForm categories={categories} />
    </div>
  );
}
