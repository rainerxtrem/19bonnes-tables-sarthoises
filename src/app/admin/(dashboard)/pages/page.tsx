import Link from "next/link";
import { Plus } from "lucide-react";
import { listPagesAdmin } from "@/lib/services/page.service";
import { StatusBadge } from "@/components/ui/badge";
import { SimpleAdminList } from "@/components/admin/simple-admin-list";

export const metadata = { title: "Pages | Administration" };

export default async function AdminPagesListPage() {
  const pages = await listPagesAdmin();

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-2xl text-ink-900">Pages</h1>
        <Link
          href="/admin/pages/new"
          className="inline-flex items-center gap-2 rounded-sm bg-wine-700 px-4 py-2 text-sm font-medium text-cream-50 transition-colors hover:bg-wine-800"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Nouvelle page
        </Link>
      </div>
      <SimpleAdminList
        headers={["Titre", "Slug", "Statut"]}
        rows={pages.map((p) => ({
          id: p.id,
          cells: [
            <span key="title" className="font-medium text-ink-900">{p.title}</span>,
            <span key="slug" className="text-ink-500">/{p.slug}</span>,
            <StatusBadge key="status" status={p.status} />,
          ],
          editHref: `/admin/pages/${p.id}/edit`,
          deleteEndpoint: `/api/admin/pages/${p.id}`,
          confirmLabel: `Supprimer la page "${p.title}" ?`,
        }))}
        emptyLabel="Aucune page pour le moment."
      />
    </div>
  );
}
