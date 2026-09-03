import Link from "next/link";
import { Download, Send } from "lucide-react";
import { listActiveSubscribers, listCampaigns } from "@/lib/services/newsletter.service";

export const metadata = { title: "Newsletter | Administration" };

export default async function AdminNewsletterPage() {
  const [subscribers, campaigns] = await Promise.all([listActiveSubscribers(), listCampaigns()]);

  return (
    <div className="space-y-10">
      <div>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl text-ink-900">Abonnés newsletter</h1>
            <p className="mt-1 text-sm text-ink-500">
              {subscribers.length} abonné{subscribers.length > 1 ? "s" : ""} actif
              {subscribers.length > 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/newsletter/nouvelle"
              className="inline-flex items-center gap-2 rounded-sm bg-wine-700 px-4 py-2 text-sm font-medium text-cream-50 transition-colors hover:bg-wine-800"
            >
              <Send className="h-4 w-4" aria-hidden />
              Nouvelle campagne
            </Link>
            {/* Lien de téléchargement de fichier, pas de navigation interne — <a> natif volontaire. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/api/admin/newsletter/export"
              className="inline-flex items-center gap-2 rounded-md border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-cream-50"
            >
              <Download className="h-4 w-4" aria-hidden />
              Exporter en CSV
            </a>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-ink-100 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-ink-100 bg-cream-50 text-left text-xs font-medium uppercase tracking-wide text-ink-500">
              <tr>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Inscrit le</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {subscribers.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-4 py-8 text-center text-ink-400">
                    Aucun abonné pour le moment.
                  </td>
                </tr>
              ) : (
                subscribers.map((subscriber) => (
                  <tr key={subscriber.id}>
                    <td className="px-4 py-3 text-ink-900">{subscriber.email}</td>
                    <td className="px-4 py-3 text-ink-500">
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

      <div>
        <h2 className="mb-4 text-lg font-semibold text-ink-900">Campagnes envoyées</h2>
        <div className="overflow-hidden rounded-lg border border-ink-100 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-ink-100 bg-cream-50 text-left text-xs font-medium uppercase tracking-wide text-ink-500">
              <tr>
                <th className="px-4 py-3">Objet</th>
                <th className="px-4 py-3">Article associé</th>
                <th className="px-4 py-3">Destinataires</th>
                <th className="px-4 py-3">Envoyée le</th>
                <th className="px-4 py-3">Par</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {campaigns.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-ink-400">
                    Aucune campagne envoyée pour le moment.
                  </td>
                </tr>
              ) : (
                campaigns.map((campaign) => (
                  <tr key={campaign.id}>
                    <td className="px-4 py-3 text-ink-900">{campaign.subject}</td>
                    <td className="px-4 py-3 text-ink-500">
                      {campaign.article ? (
                        <Link href={`/actualites/${campaign.article.slug}`} className="text-brand hover:underline">
                          {campaign.article.title}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-ink-500">{campaign.recipientCount}</td>
                    <td className="px-4 py-3 text-ink-500">
                      {campaign.sentAt.toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3 text-ink-500">{campaign.sentBy?.name ?? "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
