import { NextResponse, type NextRequest } from "next/server";
import { requireContentAccess } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api/handle-error";
import { adminGiftVoucherCreateSchema } from "@/lib/validation/gift-voucher";
import { createVoucherManually } from "@/lib/services/gift-voucher.service";
import { recordAuditLog } from "@/lib/services/audit-log.service";

/** Création manuelle d'un bon cadeau depuis l'admin — voir gift-voucher.service.ts. */
export async function POST(request: NextRequest) {
  try {
    const session = await requireContentAccess();
    const input = adminGiftVoucherCreateSchema.parse(await request.json());
    const voucher = await createVoucherManually(input);

    await recordAuditLog({
      userId: session.user.id,
      action: "gift-voucher.create",
      entityType: "GiftVoucher",
      entityId: voucher.id,
      metadata: { code: voucher.code, amountCents: voucher.amountCents },
    });

    return NextResponse.json({ voucher }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
