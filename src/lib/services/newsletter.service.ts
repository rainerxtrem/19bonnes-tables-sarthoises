import { after } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { sendMail, sendMailBatch } from "@/lib/mailer";
import { absoluteUrl } from "@/lib/seo";
import { getSiteSettings } from "@/lib/services/settings.service";
import { renderEmail, emailButton, textToParagraphsHtml } from "@/lib/email-template";

export class AlreadySubscribedError extends Error {
  constructor() {
    super("Cette adresse est déjà inscrite à la newsletter.");
    this.name = "AlreadySubscribedError";
  }
}

export async function subscribeToNewsletter(email: string, ipAddress?: string) {
  const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });
  if (existing) {
    if (existing.unsubscribedAt) {
      // Réinscription : on réactive plutôt que de créer un doublon.
      const reactivated = await prisma.newsletterSubscriber.update({
        where: { id: existing.id },
        data: { unsubscribedAt: null, subscribedAt: new Date() },
      });
      // Planifié via after() plutôt qu'attendu ou lancé "à la volée" : la
      // réponse au formulaire part sans attendre l'envoi, mais contrairement
      // à un simple appel non attendu (void ...), after() garantit que la
      // promesse s'exécute jusqu'au bout même une fois la réponse HTTP
      // envoyée — sans ça Next.js peut couper les requêtes fetch encore en
      // cours dès que le cycle de la requête se termine.
      after(() => sendWelcomeEmail(reactivated.email, reactivated.unsubscribeToken));
      return reactivated;
    }
    throw new AlreadySubscribedError();
  }

  const subscriber = await prisma.newsletterSubscriber.create({
    data: { email, ipAddress },
  });
  after(() => sendWelcomeEmail(subscriber.email, subscriber.unsubscribeToken));
  return subscriber;
}

export async function unsubscribeByToken(token: string) {
  const subscriber = await prisma.newsletterSubscriber.findUnique({ where: { unsubscribeToken: token } });
  if (!subscriber) return null;
  return prisma.newsletterSubscriber.update({
    where: { id: subscriber.id },
    data: { unsubscribedAt: new Date() },
  });
}

export async function listActiveSubscribers() {
  return prisma.newsletterSubscriber.findMany({
    where: { unsubscribedAt: null },
    orderBy: { subscribedAt: "desc" },
  });
}

/**
 * Envoie une campagne à tous les abonnés actifs et journalise l'envoi.
 * Chaque destinataire reçoit un email avec son propre lien de
 * désinscription (voir sendMailBatch). L'envoi se fait de façon synchrone
 * dans la requête : pour le volume d'abonnés attendu ici (association
 * locale, pas une liste de plusieurs milliers de contacts), ça reste très
 * largement dans les temps sans avoir besoin d'une file d'attente.
 */
export async function sendCampaign({
  subject,
  introText,
  articleId,
  actorUserId,
  // CTA générique (ex. "Offrir un bon cadeau" → /bon-cadeaux) — utilisé
  // seulement quand aucun articleId n'est fourni, pour les campagnes qui ne
  // pointent pas vers une actualité (relances saisonnières notamment, voir
  // sendSeasonalCampaignsIfDue ci-dessous).
  ctaUrl,
  ctaLabel,
}: {
  subject: string;
  introText: string;
  articleId?: string | null;
  actorUserId?: string;
  ctaUrl?: string;
  ctaLabel?: string;
}) {
  const [settings, subscribers, article] = await Promise.all([
    getSiteSettings(),
    listActiveSubscribers(),
    articleId
      ? prisma.article.findUnique({ where: { id: articleId }, include: { mainImage: true } })
      : Promise.resolve(null),
  ]);

  const articleUrl = article ? absoluteUrl(`/actualites/${article.slug}`) : null;
  const finalCtaUrl = articleUrl ?? ctaUrl ?? null;
  const finalCtaLabel = articleUrl ? "Lire l'article complet" : (ctaLabel ?? "En savoir plus");
  const bodyHtml = `
    ${textToParagraphsHtml(introText)}
    ${article?.mainImage ? `<img src="${article.mainImage.url}" alt="" style="width:100%; max-width:496px; border-radius:3px; margin:4px 0 16px; display:block;" />` : ""}
    ${finalCtaUrl ? emailButton(finalCtaLabel, finalCtaUrl) : ""}
  `;
  const textFooter = finalCtaUrl ? `\n\n${finalCtaLabel} : ${finalCtaUrl}` : "";

  const emails = subscribers.map((subscriber) => {
    const unsubscribeUrl = absoluteUrl(`/newsletter/desinscription?token=${subscriber.unsubscribeToken}`);
    return {
      to: subscriber.email,
      subject,
      text: `${introText}${textFooter}\n\nPour vous désinscrire à tout moment : ${unsubscribeUrl}`,
      html: renderEmail({
        siteName: settings.siteName,
        preheader: introText.slice(0, 140),
        bodyHtml,
        footerNote: `Pour vous désinscrire à tout moment : <a href="${unsubscribeUrl}" style="color:#642227;">${unsubscribeUrl}</a>`,
      }),
    };
  });

  const { sent, failed } = await sendMailBatch(emails);

  const campaign = await prisma.newsletterCampaign.create({
    data: {
      subject,
      introText,
      articleId: article?.id ?? null,
      recipientCount: sent,
      sentById: actorUserId ?? null,
    },
  });

  return { campaign, sent, failed, total: subscribers.length };
}

export async function listCampaigns() {
  return prisma.newsletterCampaign.findMany({
    orderBy: { sentAt: "desc" },
    include: { article: { select: { title: true, slug: true } }, sentBy: { select: { name: true } } },
  });
}

// ---------------------------------------------------------------------------
// Newsletters saisonnières automatiques
// ---------------------------------------------------------------------------

interface SeasonalOccasion {
  key: string;
  subject: string;
  introText: string;
  // Fenêtre d'envoi (mois 1-indexé, jours inclusifs) plutôt qu'une date
  // unique : si le déclencheur externe (cron) ne tourne pas pile ce jour-là
  // (panne, maintenance...), l'envoi a quand même lieu les jours suivants —
  // sans jamais doubler, grâce à la vérification "déjà envoyé cette année"
  // ci-dessous (sur le sujet exact, qui sert de clé de dédoublonnage).
  windowMonth: number;
  windowDayStart: number;
  windowDayEnd: number;
}

const SEASONAL_OCCASIONS: SeasonalOccasion[] = [
  {
    key: "noel",
    subject: "🎄 Offrez un bon cadeau pour les fêtes",
    introText:
      "Le temps des fêtes approche ! Envie d'offrir un moment gourmand à un proche ? Le bon cadeau des 19 Bonnes Tables Sarthoises se glisse sous le sapin en quelques clics, se reçoit par email en quelques secondes, et se déguste dans n'importe lequel des restaurants membres de l'association, partout en Sarthe.",
    windowMonth: 12,
    windowDayStart: 1,
    windowDayEnd: 3,
  },
  {
    key: "saint-valentin",
    subject: "❤️ Un bon cadeau pour la Saint-Valentin",
    introText:
      "La Saint-Valentin approche : et si vous offriez un dîner à deux dans l'un des restaurants membres des 19 Bonnes Tables Sarthoises ? Le bon cadeau s'achète en ligne et se reçoit par email en quelques secondes — plus qu'à choisir la table.",
    windowMonth: 2,
    windowDayStart: 1,
    windowDayEnd: 3,
  },
];

/**
 * Envoie automatiquement les newsletters saisonnières dont la fenêtre est
 * atteinte et qui n'ont pas déjà été envoyées cette année. Appelée
 * quotidiennement par un déclencheur externe (voir
 * /api/cron/seasonal-newsletter) — idempotent, sans risque à appeler
 * plusieurs fois le même jour ou plusieurs jours de suite dans la fenêtre.
 */
export async function sendSeasonalCampaignsIfDue(): Promise<{ sent: string[] }> {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const sent: string[] = [];

  for (const occasion of SEASONAL_OCCASIONS) {
    const inWindow =
      now.getMonth() + 1 === occasion.windowMonth &&
      now.getDate() >= occasion.windowDayStart &&
      now.getDate() <= occasion.windowDayEnd;
    if (!inWindow) continue;

    const alreadySent = await prisma.newsletterCampaign.findFirst({
      where: { subject: occasion.subject, sentAt: { gte: startOfYear } },
      select: { id: true },
    });
    if (alreadySent) continue;

    await sendCampaign({
      subject: occasion.subject,
      introText: occasion.introText,
      ctaUrl: absoluteUrl("/bon-cadeaux"),
      ctaLabel: "Offrir un bon cadeau",
    });
    sent.push(occasion.key);
  }

  return { sent };
}

async function sendWelcomeEmail(email: string, unsubscribeToken: string) {
  const settings = await getSiteSettings();
  const unsubscribeUrl = absoluteUrl(`/newsletter/desinscription?token=${unsubscribeToken}`);
  const homeUrl = absoluteUrl("/");

  const bodyHtml = `
    <p style="margin:0 0 16px;">Bonjour,</p>
    <p style="margin:0 0 16px;">Merci de votre inscription à la newsletter des <strong>${settings.siteName}</strong> !</p>
    <p style="margin:0 0 8px;">Vous recevrez de temps en temps nos actualités : recettes de terroir, événements et vie de l'association.</p>
    ${emailButton("Découvrir le site", homeUrl)}
  `;

  await sendMail({
    to: email,
    subject: `Bienvenue dans la newsletter des ${settings.siteName}`,
    text: `Merci de votre inscription à la newsletter des ${settings.siteName} !\n\nVous recevrez de temps en temps nos actualités : recettes de terroir, événements et vie de l'association.\n\nPour vous désinscrire à tout moment : ${unsubscribeUrl}`,
    html: renderEmail({
      siteName: settings.siteName,
      preheader: `Merci de votre inscription à la newsletter des ${settings.siteName} !`,
      bodyHtml,
      footerNote: `Pour vous désinscrire à tout moment : <a href="${unsubscribeUrl}" style="color:#642227;">${unsubscribeUrl}</a>`,
    }),
  }).catch((error) => console.error("Envoi email bienvenue newsletter échoué:", error));
}
