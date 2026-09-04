import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireTreasuryAccess } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api/handle-error";
import { setVoucherPayoutStatus } from "@/lib/services/gift-voucher.service";
import { recordAuditLog } from "@/lib/services/audit-log.service";

const bodySchema = z.object({ paid: z.boolean() });

/** Bascule le statut de versement d'un bon (ADMIN, SUPER_ADMIN ou TRESORIER). */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireTreasuryAccess();
    const { id } = await params;
    const { paid } = bodySchema.parse(await request.json());
    const voucher = await setVoucherPayoutStatus(id, paid, session.user.id);

    await recordAuditLog({
      userId: session.user.id,
      action: paid ? "gift-voucher.payout-paid" : "gift-voucher.payout-pending",
      entityType: "GiftVoucher",
      entityId: id,
    });

    return NextResponse.json({ voucher });
  } catch (error) {
    return handleApiError(error);
  }
}
