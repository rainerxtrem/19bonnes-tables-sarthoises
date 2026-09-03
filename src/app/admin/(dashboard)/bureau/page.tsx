import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { SimpleAdminList } from "@/components/admin/simple-admin-list";

export const metadata = { title: "Bureau | Administration" };

export default async function AdminBureauPage() {
  const members = await prisma.boardMember.findMany({
    include: { restaurant: { select: { name: true } } },
    orderBy: { order: "asc" },
  });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-2xl text-ink-900">Bureau de l&apos;association</h1>
        <Link
          href="/admin/bureau/new"
          className="inline-flex items-center gap-2 rounded-sm bg-wine-700 px-4 py-2 text-sm font-medium text-cream-50 transition-colors hover:bg-wine-800"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Nouveau membre
        </Link>
      </div>
      <SimpleAdminList
        headers={["Nom", "Fonction", "Restaurant", "Actif"]}
        rows={members.map((m) => ({
          id: m.id,
          cells: [
            <span key="name" className="font-medium text-ink-900">{m.firstName} {m.lastName}</span>,
            <span key="role">{m.role}</span>,
            <span key="restaurant">{m.restaurant?.name ?? "—"}</span>,
            <span key="active">{m.isActive ? "Oui" : "Non"}</span>,
          ],
          editHref: `/admin/bureau/${m.id}/edit`,
          deleteEndpoint: `/api/admin/board-members/${m.id}`,
          confirmLabel: `Supprimer ${m.firstName} ${m.lastName} ?`,
        }))}
        emptyLabel="Aucun membre pour le moment."
      />
    </div>
  );
}
