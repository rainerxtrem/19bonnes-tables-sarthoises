import { NextResponse, type NextRequest } from "next/server";
import { requireRestaurateurSession } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api/handle-error";
import { redeemVoucherSchema } from "@/lib/validation/gift-voucher";
import { redeemVoucher } from "@/lib/services/gift-voucher.service";
import { recordAuditLog } from "@/lib/services/audit-log.service";

export async function POST(request: NextRequest) {
  try {
    const session = await requireRestaurateurSession();
    const { code } = redeemVoucherSchema.parse(await request.json());
    const voucher = await redeemVoucher(code, session.user.id, session.user.restaurantId!);

    await recordAuditLog({
      userId: session.user.id,
      action: "gift-voucher.redeem",
      entityType: "GiftVoucher",
      entityId: voucher.id,
      metadata: { code: voucher.code, amountCents: voucher.amountCents },
    });

    return NextResponse.json({
      voucher: { code: voucher.code, amountCents: voucher.amountCents, redeemedAt: voucher.redeemedAt },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
