import { NextResponse, type NextRequest } from "next/server";
import { requireRestaurateurSession } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api/handle-error";
import { redeemVoucherSchema } from "@/lib/validation/gift-voucher";
import { getVoucherByCode, VoucherNotFoundError } from "@/lib/services/gift-voucher.service";

export async function POST(request: NextRequest) {
  try {
    await requireRestaurateurSession();
    const { code } = redeemVoucherSchema.parse(await request.json());
    const voucher = await getVoucherByCode(code);
    if (!voucher) throw new VoucherNotFoundError();

    return NextResponse.json({
      voucher: {
        code: voucher.code,
        amountCents: voucher.amountCents,
        status: voucher.status,
        buyerName: voucher.buyerName,
        expiresAt: voucher.expiresAt,
        redeemedAt: voucher.redeemedAt,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
