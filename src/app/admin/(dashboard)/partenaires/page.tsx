import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { SimpleAdminList } from "@/components/admin/simple-admin-list";

export const metadata = { title: "Partenaires | Administration" };

export default async function AdminPartnersPage() {
  const partners = await prisma.partner.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Partenaires</h1>
        <Link href="/admin/partenaires/new" className="inline-flex items-center justify-center rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark">
          Nouveau partenaire
        </Link>
      </div>
      <SimpleAdminList
        rows={partners}
        columns={[
          { header: "Nom", render: (p) => <span className="font-medium text-gray-900">{p.name}</span> },
          { header: "Site web", render: (p) => p.websiteUrl ?? "—" },
          { header: "Actif", render: (p) => (p.isActive ? "Oui" : "Non") },
        ]}
        editHref={(p) => `/admin/partenaires/${p.id}/edit`}
        deleteEndpoint={(p) => `/api/admin/partners/${p.id}`}
        confirmLabel={(p) => `Supprimer ${p.name} ?`}
        emptyLabel="Aucun partenaire pour le moment."
      />
    </div>
  );
}
