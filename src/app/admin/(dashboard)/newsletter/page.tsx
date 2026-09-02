import { Download } from "lucide-react";
import { listActiveSubscribers } from "@/lib/services/newsletter.service";

export const metadata = { title: "Newsletter | Administration" };

export default async function AdminNewsletterPage() {
  const subscribers = await listActiveSubscribers();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Abonnés newsletter</h1>
          <p className="mt-1 text-sm text-gray-500">
            {subscribers.length} abonné{subscribers.length > 1 ? "s" : ""} actif
            {subscribers.length > 1 ? "s" : ""}
          </p>
        </div>
        {/* Lien de téléchargement de fichier, pas de navigation interne — <a> natif volontaire. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a
          href="/api/admin/newsletter/export"
          className="inline-flex items-center gap-2 rounded-md bg-brand-dark px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark/90"
        >
          <Download className="h-4 w-4" aria-hidden />
          Exporter en CSV
        </a>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Inscrit le</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {subscribers.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-4 py-8 text-center text-gray-400">
                  Aucun abonné pour le moment.
                </td>
              </tr>
            ) : (
              subscribers.map((subscriber) => (
                <tr key={subscriber.id}>
                  <td className="px-4 py-3 text-gray-900">{subscriber.email}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {subscriber.subscribedAt.toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
