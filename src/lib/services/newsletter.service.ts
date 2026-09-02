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
}: {
  subject: string;
  introText: string;
  articleId?: string | null;
  actorUserId?: string;
}) {
  const [settings, subscribers, article] = await Promise.all([
    getSiteSettings(),
    listActiveSubscribers(),
    articleId
      ? prisma.article.findUnique({ where: { id: articleId }, include: { mainImage: true } })
      : Promise.resolve(null),
  ]);

  const articleUrl = article ? absoluteUrl(`/actualites/${article.slug}`) : null;
  const bodyHtml = `
    ${textToParagraphsHtml(introText)}
    ${article?.mainImage ? `<img src="${article.mainImage.url}" alt="" style="width:100%; max-width:496px; border-radius:3px; margin:4px 0 16px; display:block;" />` : ""}
    ${articleUrl ? emailButton("Lire l'article complet", articleUrl) : ""}
  `;
  const textFooter = articleUrl ? `\n\nLire l'article complet : ${articleUrl}` : "";

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
