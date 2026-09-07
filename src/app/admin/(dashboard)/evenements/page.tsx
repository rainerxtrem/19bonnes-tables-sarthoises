import Link from "next/link";
import { Plus } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { prisma } from "@/lib/db/prisma";
import { SimpleAdminList } from "@/components/admin/simple-admin-list";

export const metadata = { title: "Événements | Administration" };

const STATUS_LABELS: Record<string, string> = { DRAFT: "Brouillon", PUBLISHED: "Publié", ARCHIVED: "Archivé", SCHEDULED: "Planifié" };

export default async function AdminEventsPage() {
  const events = await prisma.event.findMany({ orderBy: { startAt: "desc" } });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-2xl text-ink-900">Événements</h1>
        <Link
          href="/admin/evenements/new"
          className="inline-flex items-center gap-2 rounded-sm bg-wine-700 px-4 py-2 text-sm font-medium text-cream-50 transition-colors hover:bg-wine-800"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Nouvel événement
        </Link>
      </div>
      <SimpleAdminList
        headers={["Titre", "Date", "Statut"]}
        rows={events.map((e) => ({
          id: e.id,
          cells: [
            <span key="title" className="font-medium text-ink-900">{e.title}</span>,
            <span key="date">{format(e.startAt, "d MMMM yyyy à HH:mm", { locale: fr })}</span>,
            <span key="status">{STATUS_LABELS[e.status]}</span>,
          ],
          editHref: `/admin/evenements/${e.id}/edit`,
          deleteEndpoint: `/api/admin/events/${e.id}`,
          confirmLabel: `Supprimer "${e.title}" ?`,
        }))}
        emptyLabel="Aucun événement pour le moment."
      />
    </div>
  );
}
