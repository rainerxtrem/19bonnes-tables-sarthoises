import { NextResponse, type NextRequest } from "next/server";
import { sendMail } from "@/lib/mailer";
import { renderSeasonalCampaignPreview, SEASONAL_OCCASIONS } from "@/lib/services/newsletter.service";

// Route de diagnostic TEMPORAIRE — envoie un aperçu des newsletters
// saisonnières à une seule adresse (celle demandée), sans toucher aux
// abonnés ni à l'historique des campagnes. À supprimer après usage.
export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-debug-secret");
  if (!secret || secret !== process.env.DEBUG_RESEND_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { to } = await request.json();
  if (!to) {
    return NextResponse.json({ error: "destinataire manquant" }, { status: 400 });
  }

  const sent: string[] = [];
  for (const occasion of SEASONAL_OCCASIONS) {
    const preview = await renderSeasonalCampaignPreview(occasion.key);
    await sendMail({ to, subject: `🧪 [Aperçu] ${preview.subject}`, text: preview.text, html: preview.html });
    sent.push(occasion.key);
  }

  return NextResponse.json({ ok: true, sent });
}
