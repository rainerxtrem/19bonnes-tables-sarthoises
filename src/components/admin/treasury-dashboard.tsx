"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { GiftVoucherPayoutStatus, GiftVoucherStatus } from "@prisma/client";

export interface TreasuryVoucherRow {
  id: string;
  code: string;
  amountCents: number;
  payoutStatus: GiftVoucherPayoutStatus;
  redeemedAt: string | null;
  buyerName: string;
  recipientName: string | null;
}

export interface TreasuryRestaurantRow {
  restaurantId: string;
  restaurantName: string;
  pendingCents: number;
  paidCents: number;
  vouchers: TreasuryVoucherRow[];
}

export interface TreasuryStats {
  total: number;
  byStatus: Record<GiftVoucherStatus, number>;
  soldCents: number;
  redeemedCents: number;
  pendingPayoutCents: number;
  paidPayoutCents: number;
}

const STATUS_LABELS: Record<GiftVoucherStatus, string> = {
  PENDING_PAYMENT: "Paiement en attente",
  ACTIVE: "Actifs",
  REDEEMED: "Utilisés",
  EXPIRED: "Expirés",
  CANCELLED: "Annulés",
};

function euros(cents: number) {
  return (cents / 100).toFixed(2) + " €";
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function TreasuryDashboard({ stats, restaurants }: { stats: TreasuryStats; restaurants: TreasuryRestaurantRow[] }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [pending, setPending] = useState<string | null>(null);

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function toggleVoucherPayout(voucherId: string, paid: boolean) {
    setPending(voucherId);
    await fetch(`/api/treasury/vouchers/${voucherId}/payout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paid }),
    });
    router.refresh();
    setPending(null);
  }

  async function payAllForRestaurant(restaurant: TreasuryRestaurantRow) {
    if (!window.confirm(`Marquer les ${euros(restaurant.pendingCents)} dus à "${restaurant.restaurantName}" comme versés ?`)) return;
    setPending(restaurant.restaurantId);
    await fetch(`/api/treasury/restaurants/${restaurant.restaurantId}/payout-all`, { method: "POST" });
    router.refresh();
    setPending(null);
  }

  const totalPending = restaurants.reduce((sum, r) => sum + r.pendingCents, 0);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-ink-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-400">Bons vendus</p>
          <p className="mt-1 font-display text-2xl text-ink-900">{euros(stats.soldCents)}</p>
          <p className="mt-0.5 text-xs text-ink-400">{stats.byStatus.ACTIVE + stats.byStatus.REDEEMED} bons</p>
        </div>
        <div className="rounded-lg border border-ink-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-400">Bons utilisés</p>
          <p className="mt-1 font-display text-2xl text-ink-900">{euros(stats.redeemedCents)}</p>
          <p className="mt-0.5 text-xs text-ink-400">{stats.byStatus.REDEEMED} bons</p>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-amber-700">Reste à verser</p>
          <p className="mt-1 font-display text-2xl text-amber-900">{euros(stats.pendingPayoutCents)}</p>
        </div>
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-green-700">Déjà versé</p>
          <p className="mt-1 font-display text-2xl text-green-900">{euros(stats.paidPayoutCents)}</p>
        </div>
      </div>

      <div className="rounded-lg border border-ink-100 bg-white p-4 shadow-sm">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-400">Répartition par statut</p>
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-ink-600">
          {(Object.keys(STATUS_LABELS) as GiftVoucherStatus[]).map((s) => (
            <span key={s}>
              {STATUS_LABELS[s]} : <strong className="text-ink-900">{stats.byStatus[s]}</strong>
            </span>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg text-ink-900">Versements aux restaurants</h2>
          <p className="text-sm text-ink-500">
            Total restant dû : <strong className="text-ink-900">{euros(totalPending)}</strong>
          </p>
        </div>

        {restaurants.length === 0 ? (
          <div className="rounded-lg border border-ink-100 bg-white p-8 text-center text-sm text-ink-400 shadow-sm">
            Aucun bon cadeau validé par un restaurant pour le moment.
          </div>
        ) : (
          <div className="space-y-2">
            {restaurants.map((r) => {
              const isOpen = expanded.has(r.restaurantId);
              return (
                <div key={r.restaurantId} className="overflow-hidden rounded-lg border border-ink-100 bg-white shadow-sm">
                  <button
                    onClick={() => toggleExpand(r.restaurantId)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-cream-50/60"
                  >
                    <span className="flex items-center gap-2">
                      {isOpen ? <ChevronDown className="h-4 w-4 text-ink-400" aria-hidden /> : <ChevronRight className="h-4 w-4 text-ink-400" aria-hidden />}
                      <span className="font-medium text-ink-900">{r.restaurantName}</span>
                      <span className="text-xs text-ink-400">({r.vouchers.length} bon{r.vouchers.length > 1 ? "s" : ""})</span>
                    </span>
                    <span className="flex items-center gap-4 text-sm">
                      {r.paidCents > 0 ? <span className="text-green-700">{euros(r.paidCents)} versés</span> : null}
                      <span className={r.pendingCents > 0 ? "font-medium text-amber-700" : "text-ink-400"}>
                        {euros(r.pendingCents)} restant
                      </span>
                    </span>
                  </button>

                  {isOpen ? (
                    <div className="border-t border-ink-100">
                      {r.pendingCents > 0 ? (
                        <div className="flex justify-end border-b border-ink-100 bg-cream-50/60 px-4 py-2">
                          <button
                            disabled={pending === r.restaurantId}
                            onClick={() => payAllForRestaurant(r)}
                            className="rounded-sm bg-wine-700 px-3 py-1.5 text-xs font-medium text-cream-50 hover:bg-wine-800 disabled:opacity-50"
                          >
                            Tout marquer comme versé
                          </button>
                        </div>
                      ) : null}
                      <table className="w-full text-sm">
                        <thead className="bg-cream-50 text-left text-xs font-medium uppercase tracking-wide text-ink-400">
                          <tr>
                            <th className="px-4 py-2">Code</th>
                            <th className="px-4 py-2">Montant</th>
                            <th className="px-4 py-2">Validé le</th>
                            <th className="px-4 py-2">Client</th>
                            <th className="px-4 py-2">Versement</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-ink-100">
                          {r.vouchers.map((v) => (
                            <tr key={v.id}>
                              <td className="px-4 py-2 font-mono text-xs text-ink-700">{v.code}</td>
                              <td className="px-4 py-2 font-medium text-ink-900">{euros(v.amountCents)}</td>
                              <td className="px-4 py-2 text-ink-500">{formatDate(v.redeemedAt)}</td>
                              <td className="px-4 py-2 text-ink-500">{v.recipientName || v.buyerName}</td>
                              <td className="px-4 py-2">
                                <button
                                  disabled={pending === v.id}
                                  onClick={() => toggleVoucherPayout(v.id, v.payoutStatus !== "PAID")}
                                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors disabled:opacity-50 ${
                                    v.payoutStatus === "PAID"
                                      ? "bg-green-100 text-green-800 hover:bg-green-200"
                                      : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                                  }`}
                                >
                                  {v.payoutStatus === "PAID" ? "Versé" : "Non versé"}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
