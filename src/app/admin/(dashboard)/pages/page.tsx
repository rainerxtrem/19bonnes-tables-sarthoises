import Link from "next/link";
import { listPagesAdmin } from "@/lib/services/page.service";
import { StatusBadge } from "@/components/ui/badge";
import { SimpleAdminList } from "@/components/admin/simple-admin-list";

export const metadata = { title: "Pages | Administration" };

export default async function AdminPagesListPage() {
  const pages = await listPagesAdmin();

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Pages</h1>
        <Link href="/admin/pages/new" className="inline-flex items-center justify-center rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark">
          Nouvelle page
        </Link>
      </div>
      <SimpleAdminList
        headers={["Titre", "Slug", "Statut"]}
        rows={pages.map((p) => ({
          id: p.id,
          cells: [
            <span key="title" className="font-medium text-gray-900">{p.title}</span>,
            <span key="slug" className="text-gray-500">/{p.slug}</span>,
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
