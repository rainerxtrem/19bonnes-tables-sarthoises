import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { SimpleAdminList } from "@/components/admin/simple-admin-list";

export const metadata = { title: "FAQ | Administration" };

export default async function AdminFaqPage() {
  const items = await prisma.faqItem.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-2xl text-ink-900">Foire aux questions</h1>
        <Link
          href="/admin/faq/new"
          className="inline-flex items-center gap-2 rounded-sm bg-wine-700 px-4 py-2 text-sm font-medium text-cream-50 transition-colors hover:bg-wine-800"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Nouvelle question
        </Link>
      </div>
      <SimpleAdminList
        headers={["Question", "Visible"]}
        rows={items.map((item) => ({
          id: item.id,
          cells: [
            <span key="question" className="font-medium text-ink-900">{item.question}</span>,
            <span key="active">{item.isActive ? "Oui" : "Non"}</span>,
          ],
          editHref: `/admin/faq/${item.id}/edit`,
          deleteEndpoint: `/api/admin/faq/${item.id}`,
          confirmLabel: `Supprimer cette question ?`,
        }))}
        emptyLabel="Aucune question pour le moment."
      />
    </div>
  );
}
