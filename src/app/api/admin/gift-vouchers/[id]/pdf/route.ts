import { NextResponse, type NextRequest } from "next/server";
import { requireContentAccess } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api/handle-error";
import { generateVoucherPdfById } from "@/lib/services/gift-voucher.service";

/** Téléchargement du certificat PDF d'un bon existant, depuis l'admin. */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireContentAccess();
    const { id } = await params;
    const { buffer, voucher } = await generateVoucherPdfById(id);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="bon-cadeau-${voucher.code}.pdf"`,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
