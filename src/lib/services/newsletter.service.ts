import { prisma } from "@/lib/db/prisma";
import { sendMail } from "@/lib/mailer";
import { absoluteUrl } from "@/lib/seo";
import { getSiteSettings } from "@/lib/services/settings.service";

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
      await sendWelcomeEmail(reactivated.email, reactivated.unsubscribeToken);
      return reactivated;
    }
    throw new AlreadySubscribedError();
  }

  const subscriber = await prisma.newsletterSubscriber.create({
    data: { email, ipAddress },
  });
  await sendWelcomeEmail(subscriber.email, subscriber.unsubscribeToken);
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

async function sendWelcomeEmail(email: string, unsubscribeToken: string) {
  const settings = await getSiteSettings();
  const unsubscribeUrl = absoluteUrl(`/newsletter/desinscription?token=${unsubscribeToken}`);

  await sendMail({
    to: email,
    subject: `Bienvenue dans la newsletter des ${settings.siteName}`,
    text: `Merci de votre inscription à la newsletter des ${settings.siteName} !\n\nVous recevrez de temps en temps nos actualités : recettes de terroir, événements et vie de l'association.\n\nPour vous désinscrire à tout moment : ${unsubscribeUrl}`,
    html: `<p>Merci de votre inscription à la newsletter des <strong>${settings.siteName}</strong> !</p><p>Vous recevrez de temps en temps nos actualités : recettes de terroir, événements et vie de l'association.</p><p style="color:#6f6455;font-size:12px;margin-top:24px;">Pour vous désinscrire à tout moment : <a href="${unsubscribeUrl}">${unsubscribeUrl}</a></p>`,
  }).catch((error) => console.error("Envoi email bienvenue newsletter échoué:", error));
}
