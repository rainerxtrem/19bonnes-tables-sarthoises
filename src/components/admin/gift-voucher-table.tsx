"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Download, Send, Trash2 } from "lucide-react";
import type { GiftVoucherStatus } from "@prisma/client";
import { STATUS_LABELS } from "@/components/admin/gift-voucher-status-badge";

const STATUS_SELECT_CLASSES: Record<GiftVoucherStatus, string> = {
  PENDING_PAYMENT: "bg-amber-100 text-amber-800",
  ACTIVE: "bg-green-100 text-green-800",
  REDEEMED: "bg-cream-100 text-ink-700",
  EXPIRED: "bg-red-100 text-red-700",
  CANCELLED: "bg-ink-100 text-ink-500",
};

const STATUS_VALUES: GiftVoucherStatus[] = ["PENDING_PAYMENT", "ACTIVE", "REDEEMED", "EXPIRED", "CANCELLED"];

export interface GiftVoucherRow {
  id: string;
  code: string;
  amountCents: number;
  status: GiftVoucherStatus;
  buyerName: string;
  buyerEmail: string;
  recipientName: string | null;
  recipientEmail: string | null;
  purchasedAt: string | null;
  redeemedAt: string | null;
  redeemedAtRestaurantName: string | null;
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function GiftVoucherTable({ rows }: { rows: GiftVoucherRow[] }) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [sentId, setSentId] = useState<string | null>(null);

  async function changeStatus(row: GiftVoucherRow, status: GiftVoucherStatus) {
    if (status === row.status) return;
    setPending(row.id);
    await fetch(`/api/admin/gift-vouchers/${row.id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    router.refresh();
    setPending(null);
  }

  async function resend(row: GiftVoucherRow) {
    setPending(row.id);
    const res = await fetch(`/api/admin/gift-vouchers/${row.id}/resend`, { method: "POST" });
    setPending(null);
    if (res.ok) {
      setSentId(row.id);
      setTimeout(() => setSentId((current) => (current === row.id ? null : current)), 2500);
    }
  }

  async function remove(row: GiftVoucherRow) {
    if (!window.confirm(`Supprimer définitivement le bon ${row.code} (${(row.amountCents / 100).toFixed(2)} €) ?`)) return;
    setPending(row.id);
    await fetch(`/api/admin/gift-vouchers/${row.id}`, { method: "DELETE" });
    router.refresh();
    setPending(null);
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-ink-100 bg-white shadow-sm">
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
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-4 py-8 text-center text-ink-400">
                Aucun bon cadeau pour le moment.
              </td>
            </tr>
          ) : (
            rows.map((v) => (
              <tr key={v.id} className="transition-colors hover:bg-cream-50/60">
                <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-ink-700">{v.code}</td>
                <td className="whitespace-nowrap px-4 py-3 font-medium text-ink-900">{(v.amountCents / 100).toFixed(2)} €</td>
                <td className="px-4 py-3">
                  <select
                    value={v.status}
                    disabled={pending === v.id}
                    onChange={(e) => changeStatus(v, e.target.value as GiftVoucherStatus)}
                    className={`rounded-full border-0 px-2.5 py-0.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-brand disabled:opacity-50 ${STATUS_SELECT_CLASSES[v.status]}`}
                  >
                    {STATUS_VALUES.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
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
                <td className="whitespace-nowrap px-4 py-3 text-ink-500">{formatDate(v.purchasedAt)}</td>
                <td className="px-4 py-3 text-ink-500">
                  {v.redeemedAt ? (
                    <>
                      {formatDate(v.redeemedAt)}
                      <br />
                      <span className="text-xs">{v.redeemedAtRestaurantName ?? "—"}</span>
                    </>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    {/* Lien de téléchargement de fichier, pas de navigation interne — <a> natif volontaire. */}
                    {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                    <a
                      href={`/api/admin/gift-vouchers/${v.id}/pdf`}
                      title="Télécharger le PDF"
                      className="flex h-7 w-7 items-center justify-center rounded-sm text-ink-400 transition-colors hover:bg-wine-50 hover:text-wine-700"
                    >
                      <Download className="h-3.5 w-3.5" aria-hidden />
                    </a>
                    <button
                      disabled={pending === v.id}
                      onClick={() => resend(v)}
                      title="Renvoyer par email"
                      className="flex h-7 w-7 items-center justify-center rounded-sm text-ink-400 transition-colors hover:bg-gold-100 hover:text-gold-800 disabled:opacity-50"
                    >
                      <Send className="h-3.5 w-3.5" aria-hidden />
                    </button>
                    {sentId === v.id ? <span className="text-xs text-green-700">Envoyé !</span> : null}
                    <button
                      disabled={pending === v.id}
                      onClick={() => remove(v)}
                      title="Supprimer"
                      className="flex h-7 w-7 items-center justify-center rounded-sm text-ink-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
