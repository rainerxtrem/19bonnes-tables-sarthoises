import { NextResponse, type NextRequest } from "next/server";
import { requireContentAccess } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api/handle-error";
import { resendVoucherEmailById } from "@/lib/services/gift-voucher.service";
import { recordAuditLog } from "@/lib/services/audit-log.service";

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireContentAccess();
    const { id } = await params;
    await resendVoucherEmailById(id);

    await recordAuditLog({
      userId: session.user.id,
      action: "gift-voucher.resend",
      entityType: "GiftVoucher",
      entityId: id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
