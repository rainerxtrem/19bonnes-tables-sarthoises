import Link from "next/link";
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
        <h1 className="text-xl font-semibold text-gray-900">Bureau de l&apos;association</h1>
        <Link href="/admin/bureau/new" className="inline-flex items-center justify-center rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark">
          Nouveau membre
        </Link>
      </div>
      <SimpleAdminList
        rows={members}
        columns={[
          { header: "Nom", render: (m) => <span className="font-medium text-gray-900">{m.firstName} {m.lastName}</span> },
          { header: "Fonction", render: (m) => m.role },
          { header: "Restaurant", render: (m) => m.restaurant?.name ?? "—" },
          { header: "Actif", render: (m) => (m.isActive ? "Oui" : "Non") },
        ]}
        editHref={(m) => `/admin/bureau/${m.id}/edit`}
        deleteEndpoint={(m) => `/api/admin/board-members/${m.id}`}
        confirmLabel={(m) => `Supprimer ${m.firstName} ${m.lastName} ?`}
        emptyLabel="Aucun membre pour le moment."
      />
    </div>
  );
}
