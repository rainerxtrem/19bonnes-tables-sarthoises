import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { CGV_CONTENT } from "../../../../../scripts/cgv-content";

// Route de debug ponctuelle : crée/publie la page CGV en base de production
// (postgres.railway.internal n'est joignable que depuis l'app déployée, pas
// depuis un poste local). Protégée par un secret à usage unique
// (DEBUG_CGV_SECRET) ; ce fichier et la variable Railway seront supprimés
// juste après exécution.
export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-debug-secret");
  if (!secret || secret !== process.env.DEBUG_CGV_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const page = await prisma.page.upsert({
    where: { slug: "cgv" },
    update: {
      title: "Conditions générales de vente",
      content: CGV_CONTENT,
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
    create: {
      slug: "cgv",
      title: "Conditions générales de vente",
      excerpt: "Conditions générales de vente des bons cadeaux 19 Bonnes Tables Sarthoises.",
      content: CGV_CONTENT,
      status: "PUBLISHED",
      publishedAt: new Date(),
      isSystem: true,
    },
  });

  return NextResponse.json({ ok: true, slug: page.slug, status: page.status });
}
