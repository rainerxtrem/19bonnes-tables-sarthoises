import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { listAuditLogs } from "@/lib/services/audit-log.service";

export const metadata = { title: "Journal d'activité | Administration" };

// Libellés FR pour les actions les plus courantes — le journal reste
// lisible même pour une action jamais mappée ici (repli sur l'action brute).
const ACTION_LABELS: Record<string, string> = {
  "gift-voucher.create": "Bon cadeau créé",
  "gift-voucher.delete": "Bon cadeau supprimé",
  "gift-voucher.resend": "Bon cadeau renvoyé par email",
  "gift-voucher.status": "Statut du bon cadeau modifié",
  "gift-voucher.payout-paid": "Versement marqué effectué",
  "gift-voucher.payout-pending": "Versement marqué non effectué",
  "gift-voucher.payout-all-paid": "Versements marqués effectués (restaurant)",
  "restaurant.publish": "Restaurant publié",
  "restaurant.archive": "Restaurant archivé",
};

function formatDateTime(value: Date) {
  return value.toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default async function AdminAuditLogPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") redirect("/admin");

  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const { logs, total, pageCount } = await listAuditLogs(page);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl text-ink-900">Journal d&apos;activité</h1>
        <p className="mt-1 text-sm text-ink-500">
          Historique des actions effectuées dans l&apos;administration — {total} entrée{total > 1 ? "s" : ""}.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-ink-100 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-ink-100 bg-cream-50 text-left text-xs font-medium uppercase tracking-wide text-ink-400">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Utilisateur</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Élément</th>
              <th className="px-4 py-3">Détails</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-ink-400">
                  Aucune activité enregistrée.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="transition-colors hover:bg-cream-50/60">
                  <td className="whitespace-nowrap px-4 py-3 text-ink-500">{formatDateTime(log.createdAt)}</td>
                  <td className="px-4 py-3 text-ink-700">{log.user?.name ?? "—"}</td>
                  <td className="px-4 py-3 font-medium text-ink-900">{ACTION_LABELS[log.action] ?? log.action}</td>
                  <td className="px-4 py-3 text-ink-500">
                    {log.entityType}
                    {log.entityId ? <span className="ml-1 font-mono text-xs text-ink-400">#{log.entityId.slice(0, 8)}</span> : null}
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-400">
                    {log.metadata ? <code className="break-all">{JSON.stringify(log.metadata)}</code> : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pageCount > 1 ? (
        <div className="mt-4 flex items-center justify-between text-sm text-ink-500">
          <span>
            Page {page} / {pageCount}
          </span>
          <div className="flex gap-2">
            {page > 1 ? (
              <Link href={`/admin/journal?page=${page - 1}`} className="rounded-sm border border-ink-200 px-3 py-1.5 hover:bg-cream-50">
                Précédent
              </Link>
            ) : null}
            {page < pageCount ? (
              <Link href={`/admin/journal?page=${page + 1}`} className="rounded-sm border border-ink-200 px-3 py-1.5 hover:bg-cream-50">
                Suivant
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
