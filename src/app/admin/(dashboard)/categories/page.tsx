import { prisma } from "@/lib/db/prisma";
import { CategoryManager } from "@/components/admin/category-manager";

export const metadata = { title: "Catégories | Administration" };

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { articles: true } } },
  });

  return (
    <div>
      <h1 className="mb-2 font-display text-2xl text-ink-900">Catégories</h1>
      <p className="mb-6 text-sm text-ink-500">
        Les catégories permettent de classer les actualités. Le slug (utilisé dans les URLs) est généré
        automatiquement à partir du nom si vous le laissez vide.
      </p>
      <CategoryManager initialCategories={categories} />
    </div>
  );
}
