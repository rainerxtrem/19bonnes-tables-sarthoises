import Link from "next/link";
import { listArticlesAdmin } from "@/lib/services/article.service";
import { StatusBadge } from "@/components/ui/badge";
import { SimpleAdminList } from "@/components/admin/simple-admin-list";

export const metadata = { title: "Actualités | Administration" };

export default async function AdminArticlesPage() {
  const articles = await listArticlesAdmin();

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Actualités</h1>
        <Link href="/admin/actualites/new" className="inline-flex items-center justify-center rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark">
          Nouvel article
        </Link>
      </div>
      <SimpleAdminList
        headers={["Titre", "Catégorie", "Statut"]}
        rows={articles.map((a) => ({
          id: a.id,
          cells: [
            <span key="title" className="font-medium text-gray-900">{a.title}</span>,
            <span key="category">{a.category?.name ?? "—"}</span>,
            <StatusBadge key="status" status={a.status} />,
          ],
          editHref: `/admin/actualites/${a.id}/edit`,
          deleteEndpoint: `/api/admin/articles/${a.id}`,
          confirmLabel: `Supprimer l'article "${a.title}" ?`,
        }))}
        emptyLabel="Aucun article pour le moment."
      />
    </div>
  );
}
