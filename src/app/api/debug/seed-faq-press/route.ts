import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";

// Route de debug ponctuelle : remplit la FAQ (contenu réel) et l'espace
// presse (logo officiel, à partir d'un média déjà en ligne) en production.
// Idempotente (vérifie l'existant avant de créer) : peut être rejouée sans
// risque de doublons. Supprimée juste après exécution, comme d'habitude.
export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-debug-secret");
  if (!secret || secret !== process.env.DEBUG_SEED_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const faqItems: { question: string; answer: string }[] = [
    {
      question: "Qu'est-ce que l'association des 19 Bonnes Tables Sarthoises ?",
      answer:
        "C'est la plus vieille association culinaire de France : des restaurateurs passionnés de la Sarthe, réunis autour d'une même exigence — une cuisine authentique, des produits frais et locaux, et un accueil sincère.",
    },
    {
      question: "Comment savoir quels restaurants sont membres de l'association ?",
      answer:
        "Retrouvez-les tous sur la page « Nos restaurants », avec une carte interactive pour repérer facilement celui qui vous intéresse.",
    },
    {
      question: "Comment acheter un bon cadeau ?",
      answer:
        "Rendez-vous sur la page « Bons cadeaux », choisissez le montant souhaité et réglez en ligne par carte bancaire (paiement sécurisé). Le bon cadeau vous est envoyé immédiatement par email, au format PDF.",
    },
    {
      question: "Dans quel restaurant puis-je utiliser mon bon cadeau ?",
      answer:
        "Dans n'importe lequel des restaurants membres de l'association — pas seulement celui où vous l'avez peut-être acheté. Il vous suffit de le présenter (papier ou numérique) au moment de votre venue.",
    },
    {
      question: "Quelle est la durée de validité d'un bon cadeau ?",
      answer:
        "12 mois à compter de la date d'achat. Des rappels par email sont envoyés avant l'expiration (3 mois, 1 mois puis 7 jours avant), pour ne jamais le laisser passer.",
    },
    {
      question: "Puis-je me faire rembourser un bon cadeau ?",
      answer:
        "Oui, dans un délai de 14 jours après l'achat, tant que le bon cadeau n'a pas été utilisé. Passé ce délai ou une fois utilisé, aucun remboursement n'est possible. Le détail complet est disponible dans nos conditions générales de vente.",
    },
    {
      question: "Comment le restaurant valide-t-il mon bon cadeau ?",
      answer:
        "Le restaurateur scanne le QR code du bon ou saisit son code directement depuis son espace dédié, qui vérifie en temps réel sa validité avant de l'accepter.",
    },
    {
      question: "Qu'est-ce que la Marmite Sarthoise ?",
      answer:
        "Une spécialité créée par l'association, dont la recette officielle est protégée par l'INPI. Elle est à retrouver dans nos actualités, avec son histoire et sa recette.",
    },
    {
      question: "Mon restaurant souhaite rejoindre l'association, comment faire ?",
      answer: "Contactez-nous directement depuis la page Contact en nous présentant votre établissement — nous reviendrons vers vous rapidement.",
    },
    {
      question: "Comment devenir partenaire de l'association ?",
      answer:
        "Découvrez nos partenaires actuels sur la page dédiée, et écrivez-nous depuis la page Contact pour nous présenter votre projet de partenariat.",
    },
  ];

  let faqCreated = 0;
  for (const [index, item] of faqItems.entries()) {
    const exists = await prisma.faqItem.findFirst({ where: { question: item.question } });
    if (exists) continue;
    await prisma.faqItem.create({
      data: { question: item.question, answer: item.answer, order: index, isActive: true },
    });
    faqCreated++;
  }

  // Espace presse : le logo officiel de l'association, déjà en ligne
  // (utilisé pour le favicon et l'en-tête du site) — seul visuel dont on est
  // certain qu'il est prévu pour une diffusion large. D'autres photos
  // (restaurants, événements) restent à ajouter à la main par l'association
  // depuis /admin/presse, pour choisir elle-même lesquelles sont adaptées à
  // un usage presse.
  let pressCreated = 0;
  const settings = await prisma.siteSetting.findUnique({ where: { id: "singleton" } });
  if (settings?.logoId) {
    const existingAsset = await prisma.pressAsset.findFirst({ where: { mediaId: settings.logoId } });
    if (!existingAsset) {
      await prisma.pressAsset.create({
        data: {
          label: "Logo de l'association",
          description: "Logo officiel des 19 Bonnes Tables Sarthoises, pour tout usage rédactionnel.",
          mediaId: settings.logoId,
          order: 0,
          isActive: true,
        },
      });
      pressCreated = 1;
    }
  }

  return NextResponse.json({ ok: true, faqCreated, pressCreated });
}
