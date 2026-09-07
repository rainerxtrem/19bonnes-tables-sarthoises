import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { SimpleAdminList } from "@/components/admin/simple-admin-list";

export const metadata = { title: "Espace presse | Administration" };

export default async function AdminPressPage() {
  const assets = await prisma.pressAsset.findMany({ include: { media: true }, orderBy: { order: "asc" } });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-ink-900">Espace presse</h1>
          <p className="mt-1 text-sm text-ink-500">Logos, photos et visuels téléchargeables depuis /presse.</p>
        </div>
        <Link
          href="/admin/presse/new"
          className="inline-flex items-center gap-2 rounded-sm bg-wine-700 px-4 py-2 text-sm font-medium text-cream-50 transition-colors hover:bg-wine-800"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Ajouter un visuel
        </Link>
      </div>
      <SimpleAdminList
        headers={["Libellé", "Fichier", "Visible"]}
        rows={assets.map((a) => ({
          id: a.id,
          cells: [
            <span key="label" className="font-medium text-ink-900">{a.label}</span>,
            <span key="file" className="font-mono text-xs">{a.media.filename}</span>,
            <span key="active">{a.isActive ? "Oui" : "Non"}</span>,
          ],
          editHref: `/admin/presse/${a.id}/edit`,
          deleteEndpoint: `/api/admin/press-assets/${a.id}`,
          confirmLabel: `Supprimer "${a.label}" ?`,
        }))}
        emptyLabel="Aucun visuel pour le moment."
      />
    </div>
  );
}
