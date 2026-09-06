import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { MENTIONS_LEGALES_CONTENT, POLITIQUE_CONFIDENTIALITE_CONTENT } from "../../../../../scripts/legal-content-update";

// Route de debug ponctuelle : met à jour le contenu des pages "Mentions
// légales" et "Politique de confidentialité" déjà publiées, pour y intégrer
// la vente de bons cadeaux (Stripe, Resend). Protégée par un secret à usage
// unique (DEBUG_LEGAL_SECRET) ; ce fichier et la variable Railway seront
// supprimés juste après exécution (voir scripts/create-cgv-page.ts pour le
// même pattern déjà utilisé).
export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-debug-secret");
  if (!secret || secret !== process.env.DEBUG_LEGAL_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const mentions = await prisma.page.update({
    where: { slug: "mentions-legales" },
    data: { content: MENTIONS_LEGALES_CONTENT },
  });
  const politique = await prisma.page.update({
    where: { slug: "politique-de-confidentialite" },
    data: { content: POLITIQUE_CONFIDENTIALITE_CONTENT },
  });

  return NextResponse.json({
    ok: true,
    updated: [
      { slug: mentions.slug, status: mentions.status },
      { slug: politique.slug, status: politique.status },
    ],
  });
}
