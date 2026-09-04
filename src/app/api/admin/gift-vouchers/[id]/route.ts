import { NextResponse, type NextRequest } from "next/server";
import { requireContentAccess } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api/handle-error";
import { deleteVoucher, getVoucherById } from "@/lib/services/gift-voucher.service";
import { recordAuditLog } from "@/lib/services/audit-log.service";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const session = await requireContentAccess();
    const { id } = await params;
    const voucher = await getVoucherById(id);
    await deleteVoucher(id);

    await recordAuditLog({
      userId: session.user.id,
      action: "gift-voucher.delete",
      entityType: "GiftVoucher",
      entityId: id,
      metadata: { code: voucher.code, amountCents: voucher.amountCents, status: voucher.status },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
