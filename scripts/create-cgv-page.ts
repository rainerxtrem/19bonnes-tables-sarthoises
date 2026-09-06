/**
 * Script ponctuel : crée/publie la page CGV (slug "cgv") en base de
 * production, via `railway run` (injecte DATABASE_URL sans jamais exposer le
 * secret dans ce terminal). Idempotent (upsert par slug) : peut être relancé
 * sans risque si besoin.
 *
 * Usage : railway run -- npx tsx scripts/create-cgv-page.ts
 */
import { PrismaClient } from "@prisma/client";
import { CGV_CONTENT } from "./cgv-content";

const prisma = new PrismaClient();

async function main() {
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
  console.log(`Page CGV ${page.status === "PUBLISHED" ? "publiée" : "créée"} : /${page.slug}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
