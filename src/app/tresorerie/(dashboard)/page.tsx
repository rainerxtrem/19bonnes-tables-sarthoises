import type { Metadata } from "next";
import { listRestaurantPayouts, getGiftVoucherStats } from "@/lib/services/gift-voucher.service";
import { TreasuryDashboard, type TreasuryRestaurantRow } from "@/components/admin/treasury-dashboard";

export const metadata: Metadata = { title: "Trésorerie" };

export default async function TresoreriePage() {
  const [payouts, stats] = await Promise.all([listRestaurantPayouts(), getGiftVoucherStats()]);

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
        <h1 className="text-xl font-semibold text-gray-900">Trésorerie</h1>
        <p className="mt-1 text-sm text-gray-500">
          Sommes dues aux restaurants pour les bons cadeaux qu&apos;ils ont validés, et statistiques bons cadeaux.
        </p>
      </div>
      <TreasuryDashboard stats={stats} restaurants={restaurants} />
    </div>
  );
}
