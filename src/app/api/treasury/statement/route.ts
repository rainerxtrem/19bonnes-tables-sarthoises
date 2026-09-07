import { NextResponse, type NextRequest } from "next/server";
import { requireTreasuryAccess } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api/handle-error";
import { listRestaurantPayoutsInRange } from "@/lib/services/gift-voucher.service";
import { generateTreasuryStatementPdf } from "@/lib/services/treasury-statement-pdf";
import { getSiteSettings } from "@/lib/services/settings.service";

// Accessible aux deux portails (voir /admin/tresorerie et /tresorerie) :
// même route API pour les deux, comme les autres endpoints /api/treasury/*
// déjà partagés, gardée par requireTreasuryAccess() (SUPER_ADMIN/ADMIN/
// TRESORIER) plutôt que par le préfixe d'URL.
export async function GET(request: NextRequest) {
  try {
    await requireTreasuryAccess();

    // "month" au format YYYY-MM ; par défaut le mois en cours. Construit en
    // heure locale du serveur (pas UTC) pour que "le mois en cours" corresponde
    // à ce que voit l'utilisateur au moment du clic.
    const monthParam = request.nextUrl.searchParams.get("month");
    const now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth(); // 0-indexé
    if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
      const [y, m] = monthParam.split("-");
      year = Number(y);
      month = Number(m) - 1;
    }
    const from = new Date(year, month, 1);
    const to = new Date(year, month + 1, 1);

    const [restaurants, settings] = await Promise.all([listRestaurantPayoutsInRange(from, to), getSiteSettings()]);

    const periodLabel = from.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
    const pdf = await generateTreasuryStatementPdf({
      siteName: settings.siteName,
      periodLabel: periodLabel.charAt(0).toUpperCase() + periodLabel.slice(1),
      restaurants: restaurants.map((r) => ({
        restaurantName: r.restaurantName,
        pendingCents: r.pendingCents,
        paidCents: r.paidCents,
        vouchers: r.vouchers.map((v) => ({
          code: v.code,
          amountCents: v.amountCents,
          redeemedAt: v.redeemedAt,
          payoutStatus: v.payoutStatus,
          buyerName: v.buyerName,
          recipientName: v.recipientName,
        })),
      })),
    });

    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="releve-${year}-${String(month + 1).padStart(2, "0")}.pdf"`,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
