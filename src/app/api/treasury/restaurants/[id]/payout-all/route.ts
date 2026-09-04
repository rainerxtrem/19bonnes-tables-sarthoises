import { NextResponse, type NextRequest } from "next/server";
import { requireTreasuryAccess } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api/handle-error";
import { markRestaurantPayoutsPaid } from "@/lib/services/gift-voucher.service";
import { recordAuditLog } from "@/lib/services/audit-log.service";

/** Marque en une fois tous les bons en attente de versement d'un restaurant. */
export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireTreasuryAccess();
    const { id } = await params;
    const count = await markRestaurantPayoutsPaid(id, session.user.id);

    await recordAuditLog({
      userId: session.user.id,
      action: "gift-voucher.payout-all-paid",
      entityType: "Restaurant",
      entityId: id,
      metadata: { count },
    });

    return NextResponse.json({ count });
  } catch (error) {
    return handleApiError(error);
  }
}
