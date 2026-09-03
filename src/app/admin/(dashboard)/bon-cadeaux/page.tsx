import { Download } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { PageForm } from "@/components/admin/page-form";
import { listVouchersAdmin } from "@/lib/services/gift-voucher.service";
import { StatusBadge as GiftVoucherStatusBadge } from "@/components/admin/gift-voucher-status-badge";

export const metadata = { title: "Bons cadeaux | Administration" };

export default async function AdminBonCadeauxPage() {
  const [page, vouchers] = await Promise.all([
    prisma.page.findUnique({ where: { slug: "bon-cadeaux" } }),
    listVouchersAdmin(),
  ]);

  const activeCount = vouchers.filter((v) => v.status === "ACTIVE").length;
  const redeemedCount = vouchers.filter((v) => v.status === "REDEEMED").length;
  const totalSoldCents = vouchers
    .filter((v) => v.status === "ACTIVE" || v.status === "REDEEMED")
    .reduce((sum, v) => sum + v.amountCents, 0);

  return (
    <div className="space-y-10">
      <div>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl text-ink-900">Bons cadeaux</h1>
            <p className="mt-1 text-sm text-ink-500">
              {activeCount} bon{activeCount > 1 ? "s" : ""} actif{activeCount > 1 ? "s" : ""} · {redeemedCount}{" "}
              utilisé{redeemedCount > 1 ? "s" : ""} · {(totalSoldCents / 100).toFixed(2)} € vendus au total
            </p>
          </div>
          {/* Lien de téléchargement de fichier, pas de navigation interne — <a> natif volontaire. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href="/api/admin/gift-vouchers/export"
            className="inline-flex items-center gap-2 rounded-md border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-cream-50"
          >
            <Download className="h-4 w-4" aria-hidden />
            Exporter en CSV
          </a>
        </div>

        <div className="overflow-hidden rounded-lg border border-ink-100 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-ink-100 bg-cream-50 text-left text-xs font-medium uppercase tracking-wide text-ink-400">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Montant</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Acheteur</th>
                <th className="px-4 py-3">Bénéficiaire</th>
                <th className="px-4 py-3">Acheté le</th>
                <th className="px-4 py-3">Utilisé le / où</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {vouchers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-ink-400">
                    Aucun bon cadeau pour le moment.
                  </td>
                </tr>
              ) : (
                vouchers.map((v) => (
                  <tr key={v.id} className="transition-colors hover:bg-cream-50/60">
                    <td className="px-4 py-3 font-mono text-xs text-ink-700">{v.code}</td>
                    <td className="px-4 py-3 font-medium text-ink-900">{(v.amountCents / 100).toFixed(2)} €</td>
                    <td className="px-4 py-3">
                      <GiftVoucherStatusBadge status={v.status} />
                    </td>
                    <td className="px-4 py-3 text-ink-500">
                      {v.buyerName}
                      <br />
                      <span className="text-xs">{v.buyerEmail}</span>
                    </td>
                    <td className="px-4 py-3 text-ink-500">
                      {v.recipientEmail ? (
                        <>
                          {v.recipientName || "—"}
                          <br />
                          <span className="text-xs">{v.recipientEmail}</span>
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-ink-500">
                      {v.purchasedAt
                        ? v.purchasedAt.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-ink-500">
                      {v.redeemedAt ? (
                        <>
                          {v.redeemedAt.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })}
                          <br />
                          <span className="text-xs">{v.redeemedAtRestaurant?.name ?? "—"}</span>
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="mb-4 font-display text-lg text-ink-900">Contenu de la page /bon-cadeaux</h2>
        <p className="mb-6 text-sm text-ink-500">
          Ce texte est affiché au-dessus du formulaire d&apos;achat sur la page publique.
        </p>
        {page ? <PageForm page={page} /> : <p className="text-sm text-red-600">Page introuvable — relancez le seed.</p>}
      </div>
    </div>
  );
}
