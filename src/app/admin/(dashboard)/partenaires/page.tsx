import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { SimpleAdminList } from "@/components/admin/simple-admin-list";

export const metadata = { title: "Partenaires | Administration" };

export default async function AdminPartnersPage() {
  const partners = await prisma.partner.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-2xl text-ink-900">Partenaires</h1>
        <Link
          href="/admin/partenaires/new"
          className="inline-flex items-center gap-2 rounded-sm bg-wine-700 px-4 py-2 text-sm font-medium text-cream-50 transition-colors hover:bg-wine-800"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Nouveau partenaire
        </Link>
      </div>
      <SimpleAdminList
        headers={["Nom", "Site web", "Actif"]}
        rows={partners.map((p) => ({
          id: p.id,
          cells: [
            <span key="name" className="font-medium text-ink-900">{p.name}</span>,
            <span key="website">{p.websiteUrl ?? "—"}</span>,
            <span key="active">{p.isActive ? "Oui" : "Non"}</span>,
          ],
          editHref: `/admin/partenaires/${p.id}/edit`,
          deleteEndpoint: `/api/admin/partners/${p.id}`,
          confirmLabel: `Supprimer ${p.name} ?`,
        }))}
        emptyLabel="Aucun partenaire pour le moment."
      />
    </div>
  );
}
