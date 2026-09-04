import { listRestaurantPayouts, getGiftVoucherStats } from "@/lib/services/gift-voucher.service";
import { TreasuryDashboard, type TreasuryRestaurantRow } from "@/components/admin/treasury-dashboard";

export const metadata = { title: "Trésorerie | Administration" };

export default async function AdminTresoreriePage() {
  const [payouts, stats] = await Promise.all([listRestaurantPayouts(), getGiftVoucherStats()]);

  // Dates non sérialisables telles quelles à travers la frontière
  // Server → Client Component : converties en ISO string ici.
  const restaurants: TreasuryRestaurantRow[] = payouts.map((r) => ({
    restaurantId: r.restaurantId,
    restaurantName: r.restaurantName,
    pendingCents: r.pendingCents,
    paidCents: r.paidCents,
    vouchers: r.vouchers.map((v) => ({
      id: v.id,
      code: v.code,
      amountCents: v.amountCents,
      payoutStatus: v.payoutStatus,
      redeemedAt: v.redeemedAt?.toISOString() ?? null,
      buyerName: v.buyerName,
      recipientName: v.recipientName,
    })),
  }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl text-ink-900">Trésorerie</h1>
        <p className="mt-1 text-sm text-ink-500">
          Sommes dues aux restaurants pour les bons cadeaux qu&apos;ils ont validés, et statistiques bons cadeaux.
        </p>
      </div>
      <TreasuryDashboard stats={stats} restaurants={restaurants} />
    </div>
  );
}
