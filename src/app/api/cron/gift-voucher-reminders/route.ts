import { NextResponse, type NextRequest } from "next/server";
import { sendExpiryReminders } from "@/lib/services/gift-voucher.service";

// Déclenchée par un planificateur externe (voir .github/workflows/
// gift-voucher-reminders.yml) plutôt qu'un cron interne à l'app : Railway
// n'offre pas de cron pour un service web toujours démarré sans en faire un
// service séparé. Protégée par un secret partagé plutôt qu'une session —
// appelée sans utilisateur connecté.
export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-cron-secret");
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const result = await sendExpiryReminders();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("Relances bons cadeaux échouées:", error);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}
