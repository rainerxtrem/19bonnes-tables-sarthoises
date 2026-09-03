import { NextResponse } from "next/server";
import { requireContentAccess } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api/handle-error";
import { listVouchersAdmin } from "@/lib/services/gift-voucher.service";

function escapeCsvField(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

export async function GET() {
  try {
    await requireContentAccess();
    const vouchers = await listVouchersAdmin();

    const rows = [
      ["code", "montant (€)", "statut", "acheteur", "email acheteur", "bénéficiaire", "email bénéficiaire", "acheté le", "utilisé le", "utilisé où"],
      ...vouchers.map((v) => [
        v.code,
        (v.amountCents / 100).toFixed(2),
        v.status,
        v.buyerName,
        v.buyerEmail,
        v.recipientName ?? "",
        v.recipientEmail ?? "",
        v.purchasedAt?.toISOString() ?? "",
        v.redeemedAt?.toISOString() ?? "",
        v.redeemedAtRestaurant?.name ?? "",
      ]),
    ];
    const csv = rows.map((row) => row.map(escapeCsvField).join(",")).join("\r\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="bons-cadeaux.csv"`,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
