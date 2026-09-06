import { NextResponse, type NextRequest } from "next/server";
import { requireGiftVoucherAccess } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api/handle-error";
import { adminGiftVoucherStatusSchema } from "@/lib/validation/gift-voucher";
import { setVoucherStatus } from "@/lib/services/gift-voucher.service";
import { recordAuditLog } from "@/lib/services/audit-log.service";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireGiftVoucherAccess();
    const { id } = await params;
    const { status } = adminGiftVoucherStatusSchema.parse(await request.json());
    const voucher = await setVoucherStatus(id, status);

    await recordAuditLog({
      userId: session.user.id,
      action: "gift-voucher.status",
      entityType: "GiftVoucher",
      entityId: id,
      metadata: { status },
    });

    return NextResponse.json({ voucher });
  } catch (error) {
    return handleApiError(error);
  }
}
