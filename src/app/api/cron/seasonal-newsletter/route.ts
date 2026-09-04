import { NextResponse, type NextRequest } from "next/server";
import { sendSeasonalCampaignsIfDue } from "@/lib/services/newsletter.service";

// Même secret partagé que les autres routes de cron (voir
// .github/workflows/) — déclenchée quotidiennement, n'envoie réellement
// que sur les quelques jours de fenêtre de chaque occasion (voir
// sendSeasonalCampaignsIfDue).
export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-cron-secret");
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const result = await sendSeasonalCampaignsIfDue();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("Newsletter saisonnière échouée:", error);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}
