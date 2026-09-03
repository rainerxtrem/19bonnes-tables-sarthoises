import { NextResponse, type NextRequest } from "next/server";
import { resendVoucherEmail } from "@/lib/services/gift-voucher.service";

// Route de diagnostic TEMPORAIRE — protégée par un secret à usage unique
// (DEBUG_RESEND_SECRET), pour déclencher un renvoi manuel depuis
// l'environnement de prod (accès aux vraies clés Resend/DB) sans jamais
// exposer ces secrets en local. À supprimer après usage — voir historique
// git pour le précédent du même genre (diagnostic SMTP).
export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-debug-secret");
  if (!secret || secret !== process.env.DEBUG_RESEND_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { code } = await request.json();
  if (!code) {
    return NextResponse.json({ error: "code manquant" }, { status: 400 });
  }

  try {
    await resendVoucherEmail(code);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("resend-voucher debug route error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
