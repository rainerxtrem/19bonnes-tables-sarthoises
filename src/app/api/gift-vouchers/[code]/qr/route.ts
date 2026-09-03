import { NextResponse, type NextRequest } from "next/server";
import QRCode from "qrcode";

// Image PNG générée à la volée (pas de data: URI ni de pièce jointe dans
// l'email — voir email-template usage dans gift-voucher.service.ts) : une
// vraie URL http(s) est la méthode la plus universellement supportée par
// les clients mail pour afficher une image inline.
export async function GET(_request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  try {
    const buffer = await QRCode.toBuffer(code.toUpperCase(), { margin: 1, width: 400 });
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "image/png",
        // Le contenu d'un code donné ne change jamais (c'est juste le texte
        // du code encodé) — cache long et immuable, y compris côté clients
        // mail qui re-fetchent l'image à chaque ouverture.
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Génération du QR code impossible" }, { status: 400 });
  }
}
