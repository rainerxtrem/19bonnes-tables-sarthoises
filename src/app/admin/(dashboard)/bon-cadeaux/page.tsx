import Link from "next/link";
import { Download, Plus } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { PageForm } from "@/components/admin/page-form";
import { listVouchersAdmin } from "@/lib/services/gift-voucher.service";
import { GiftVoucherTable, type GiftVoucherRow } from "@/components/admin/gift-voucher-table";

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

  // Dates non sérialisables telles quelles à travers la frontière
  // Server → Client Component : converties en ISO string ici.
  const rows: GiftVoucherRow[] = vouchers.map((v) => ({
    id: v.id,
    code: v.code,
    amountCents: v.amountCents,
    status: v.status,
    buyerName: v.buyerName,
    buyerEmail: v.buyerEmail,
    recipientName: v.recipientName,
    recipientEmail: v.recipientEmail,
    purchasedAt: v.purchasedAt?.toISOString() ?? null,
    redeemedAt: v.redeemedAt?.toISOString() ?? null,
    redeemedAtRestaurantName: v.redeemedAtRestaurant?.name ?? null,
  }));

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
          <div className="flex items-center gap-3">
            {/* Lien de téléchargement de fichier, pas de navigation interne — <a> natif volontaire. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/api/admin/gift-vouchers/export"
              className="inline-flex items-center gap-2 rounded-md border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-cream-50"
            >
              <Download className="h-4 w-4" aria-hidden />
              Exporter en CSV
            </a>
            <Link
              href="/admin/bon-cadeaux/new"
              className="inline-flex items-center gap-2 rounded-sm bg-wine-700 px-4 py-2 text-sm font-medium text-cream-50 transition-colors hover:bg-wine-800"
            >
              <Plus className="h-4 w-4" aria-hidden />
              Nouveau bon cadeau
            </Link>
          </div>
        </div>

        <GiftVoucherTable rows={rows} />
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
