import { prisma } from "@/lib/db/prisma";
import { getStripeClient } from "@/lib/stripe";
import { generateUniqueVoucherCode } from "@/lib/gift-voucher-code";
import { sendMail } from "@/lib/mailer";
import { renderEmail, emailButton } from "@/lib/email-template";
import { absoluteUrl } from "@/lib/seo";
import { getSiteSettings } from "@/lib/services/settings.service";
import { generateVoucherPdf } from "@/lib/services/gift-voucher-pdf";
import type { GiftVoucherPurchaseInput, AdminGiftVoucherCreateInput } from "@/lib/validation/gift-voucher";
import type { GiftVoucherStatus } from "@prisma/client";

// Durée de validité légale usuelle pour un bon d'achat/carte cadeau en
// France (pratique courante — voir mentions légales pour le détail).
const VALIDITY_MONTHS = 12;

export class VoucherNotFoundError extends Error {
  constructor() {
    super("Aucun bon cadeau ne correspond à ce code.");
    this.name = "VoucherNotFoundError";
  }
}

export class VoucherNotRedeemableError extends Error {
  constructor(public readonly status: string) {
    super("Ce bon cadeau n'est plus utilisable.");
    this.name = "VoucherNotRedeemableError";
  }
}

/**
 * Crée le bon en base (statut PENDING_PAYMENT) puis la session de paiement
 * Stripe correspondante. Le code est généré dès maintenant (pas seulement
 * après paiement) pour pouvoir l'inclure dans les métadonnées Stripe et le
 * retrouver de façon fiable au retour du webhook.
 */
export async function createVoucherCheckout(input: GiftVoucherPurchaseInput) {
  const code = await generateUniqueVoucherCode();
  const amountCents = Math.round(input.amount * 100);

  const voucher = await prisma.giftVoucher.create({
    data: {
      code,
      amountCents,
      buyerName: input.buyerName,
      buyerEmail: input.buyerEmail,
      recipientName: input.recipientName || null,
      recipientEmail: input.recipientEmail || null,
      message: input.message || null,
    },
  });

  const settings = await getSiteSettings();
  const stripe = getStripeClient();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: input.buyerEmail,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: amountCents,
          product_data: {
            name: `Bon cadeau ${settings.siteName}`,
            description: `Bon cadeau d'une valeur de ${(amountCents / 100).toFixed(2)} € — utilisable dans n'importe lequel des restaurants membres.`,
          },
        },
      },
    ],
    metadata: { voucherId: voucher.id, voucherCode: code },
    success_url: absoluteUrl(`/bon-cadeaux/succes?code=${code}`),
    cancel_url: absoluteUrl("/bon-cadeaux"),
  });

  const updated = await prisma.giftVoucher.update({
    where: { id: voucher.id },
    data: { stripeSessionId: session.id },
  });

  return { voucher: updated, checkoutUrl: session.url };
}

/** Appelé par le webhook Stripe une fois le paiement confirmé. */
export async function activateVoucherFromCheckout(sessionId: string, paymentIntentId: string | null) {
  const voucher = await prisma.giftVoucher.findUnique({ where: { stripeSessionId: sessionId } });
  if (!voucher) {
    console.error("Webhook Stripe : aucun bon cadeau trouvé pour la session", sessionId);
    return;
  }
  // Idempotence : Stripe peut renvoyer le même événement plusieurs fois.
  if (voucher.status !== "PENDING_PAYMENT") return;

  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setMonth(expiresAt.getMonth() + VALIDITY_MONTHS);

  const activated = await prisma.giftVoucher.update({
    where: { id: voucher.id },
    data: {
      status: "ACTIVE",
      purchasedAt: now,
      expiresAt,
      stripePaymentIntentId: paymentIntentId,
    },
  });

  await sendVoucherEmail(activated);
}

/**
 * Création manuelle depuis l'admin — pas de paiement Stripe (remise en
 * main propre, geste commercial, vente hors ligne, etc.). Le bon est actif
 * immédiatement, avec la même durée de validité que les bons achetés en
 * ligne. `sendEmail` est un choix explicite : un bon peut être créé sans
 * envoi immédiat (imprimé et remis physiquement), l'admin pourra toujours
 * le renvoyer plus tard.
 */
export async function createVoucherManually(input: AdminGiftVoucherCreateInput) {
  const code = await generateUniqueVoucherCode();
  const amountCents = Math.round(input.amount * 100);
  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setMonth(expiresAt.getMonth() + VALIDITY_MONTHS);

  const voucher = await prisma.giftVoucher.create({
    data: {
      code,
      amountCents,
      status: "ACTIVE",
      buyerName: input.buyerName,
      buyerEmail: input.buyerEmail,
      recipientName: input.recipientName || null,
      recipientEmail: input.recipientEmail || null,
      message: input.message || null,
      purchasedAt: now,
      expiresAt,
    },
  });

  if (input.sendEmail) {
    await sendVoucherEmail(voucher);
  }

  return voucher;
}

async function sendVoucherEmail(voucher: {
  code: string;
  amountCents: number;
  buyerName: string;
  buyerEmail: string;
  recipientName: string | null;
  recipientEmail: string | null;
  message: string | null;
  expiresAt: Date | null;
}) {
  const settings = await getSiteSettings();
  const amount = (voucher.amountCents / 100).toFixed(2);
  const to = voucher.recipientEmail || voucher.buyerEmail;
  const isGift = Boolean(voucher.recipientEmail && voucher.recipientEmail !== voucher.buyerEmail);
  const expiryLabel = voucher.expiresAt
    ? voucher.expiresAt.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
    : null;
  const logoUrl = settings.logo?.url ?? null;

  // Le visuel "certificat" (cadre doré, sceau, volet d'authentification
  // avec QR) vit désormais dans une pièce jointe PDF plutôt que dans le
  // corps HTML de l'email — bien plus fidèle au design voulu que ce que
  // les clients mail savent restituer (dégradés, polices, double-cadre).
  let pdfAttachment: { filename: string; content: string }[] | undefined;
  try {
    const pdfBuffer = await generateVoucherPdf({
      amountLabel: amount,
      code: voucher.code,
      expiryLabel,
      buyerName: voucher.buyerName,
      recipientName: isGift ? voucher.recipientName : null,
      logoUrl,
      siteName: settings.siteName,
      contactEmail: settings.contactEmail,
    });
    pdfAttachment = [{ filename: `bon-cadeau-${voucher.code}.pdf`, content: pdfBuffer.toString("base64") }];
  } catch (error) {
    console.error("Génération du PDF bon cadeau échouée:", error);
  }

  const bodyHtml = `
    <p style="margin:0 0 16px;">Bonjour${isGift && voucher.recipientName ? " " + voucher.recipientName : ""},</p>
    <p style="margin:0 0 16px;">
      ${
        isGift
          ? `<strong>${voucher.buyerName}</strong> vous offre un bon cadeau de <strong>${amount} €</strong> à utiliser dans l'un des restaurants membres des ${settings.siteName} !`
          : `Merci pour votre achat ! Voici votre bon cadeau de <strong>${amount} €</strong>, utilisable dans n'importe lequel des restaurants membres des ${settings.siteName}.`
      }
    </p>
    ${voucher.message && isGift ? `<p style="margin:0 0 16px; padding:14px; background-color:#faf6ee; border-radius:3px; font-style:italic;">« ${voucher.message} »</p>` : ""}
    <div style="text-align:center; margin:24px 0; padding:20px; background-color:#faf6ee; border-radius:4px;">
      <p style="margin:0 0 6px; font-size:11px; letter-spacing:1px; text-transform:uppercase; color:#8d8471;">Votre code</p>
      <p style="margin:0; font-family:'Courier New', monospace; font-size:24px; letter-spacing:2px; color:#231e1a; font-weight:bold;">${voucher.code}</p>
    </div>
    <p style="margin:0 0 8px; font-size:13px; color:#6f6455;">
      Votre bon cadeau, prêt à imprimer, se trouve en pièce jointe (PDF). Présentez-le — imprimé ou sur votre téléphone, code seul suffit aussi — directement au restaurant de votre choix parmi les membres de l'association.
      ${expiryLabel ? `Valable jusqu'au ${expiryLabel}.` : ""}
    </p>
    ${emailButton("Voir les restaurants membres", absoluteUrl("/nos-restaurants"))}
  `;

  await sendMail({
    to,
    subject: isGift ? `${voucher.buyerName} vous offre un bon cadeau !` : "Votre bon cadeau",
    text: `Votre bon cadeau de ${amount} € : ${voucher.code}\n\nUtilisable dans n'importe lequel des restaurants membres des ${settings.siteName}.${expiryLabel ? ` Valable jusqu'au ${expiryLabel}.` : ""}\n\nVotre certificat est en pièce jointe (PDF).`,
    html: renderEmail({
      siteName: settings.siteName,
      preheader: `Votre bon cadeau de ${amount} € — code ${voucher.code}`,
      bodyHtml,
    }),
    attachments: pdfAttachment,
  }).catch((error) => console.error("Envoi email bon cadeau échoué:", error));

  // Si acheté pour quelqu'un d'autre, l'acheteur reçoit aussi une
  // confirmation (sans le QR/code, juste une trace de son achat).
  if (isGift) {
    await sendMail({
      to: voucher.buyerEmail,
      subject: "Confirmation de votre achat de bon cadeau",
      text: `Votre bon cadeau de ${amount} € a bien été envoyé à ${voucher.recipientEmail}.`,
      html: renderEmail({
        siteName: settings.siteName,
        preheader: `Votre bon cadeau de ${amount} € a été envoyé`,
        bodyHtml: `<p style="margin:0 0 16px;">Bonjour ${voucher.buyerName},</p><p style="margin:0;">Votre bon cadeau de <strong>${amount} €</strong> a bien été envoyé à <strong>${voucher.recipientEmail}</strong>. Merci pour votre achat !</p>`,
      }),
    }).catch((error) => console.error("Envoi email confirmation acheteur échoué:", error));
  }
}

export async function getVoucherByCode(code: string) {
  return prisma.giftVoucher.findUnique({
    where: { code: code.trim().toUpperCase() },
  });
}

/** Renvoie l'email (avec PDF) pour un bon déjà actif — ex. "je n'ai rien reçu". */
export async function resendVoucherEmail(code: string) {
  const voucher = await getVoucherByCode(code);
  if (!voucher) throw new VoucherNotFoundError();
  await sendVoucherEmail(voucher);
}

/** Valide et marque un bon comme utilisé — appelé depuis l'espace restaurateur. */
export async function redeemVoucher(code: string, actorUserId: string, restaurantId: string) {
  const voucher = await getVoucherByCode(code);
  if (!voucher) throw new VoucherNotFoundError();

  if (voucher.status === "ACTIVE" && voucher.expiresAt && voucher.expiresAt < new Date()) {
    await prisma.giftVoucher.update({ where: { id: voucher.id }, data: { status: "EXPIRED" } });
    throw new VoucherNotRedeemableError("EXPIRED");
  }
  if (voucher.status !== "ACTIVE") {
    throw new VoucherNotRedeemableError(voucher.status);
  }

  // updateMany + where status:"ACTIVE" plutôt qu'un simple update : évite
  // une double validation en cas de scan quasi simultané dans deux
  // restaurants différents (condition de course).
  const result = await prisma.giftVoucher.updateMany({
    where: { id: voucher.id, status: "ACTIVE" },
    data: {
      status: "REDEEMED",
      redeemedAt: new Date(),
      redeemedByUserId: actorUserId,
      redeemedAtRestaurantId: restaurantId,
    },
  });

  if (result.count === 0) throw new VoucherNotRedeemableError("REDEEMED");

  return prisma.giftVoucher.findUniqueOrThrow({ where: { id: voucher.id } });
}

export async function listVouchersAdmin() {
  return prisma.giftVoucher.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      redeemedAtRestaurant: { select: { name: true } },
      redeemedByUser: { select: { name: true } },
    },
  });
}

export async function getVoucherById(id: string) {
  const voucher = await prisma.giftVoucher.findUnique({ where: { id } });
  if (!voucher) throw new VoucherNotFoundError();
  return voucher;
}

/** Renvoie l'email (avec PDF) pour un bon donné — utilisé par l'admin (bouton "Renvoyer"). */
export async function resendVoucherEmailById(id: string) {
  const voucher = await getVoucherById(id);
  await sendVoucherEmail(voucher);
}

/**
 * Change le statut d'un bon depuis l'admin (correction manuelle — ex.
 * annuler un bon, forcer une validation en cas de souci technique en
 * salle, ou réactiver un bon expiré par erreur). Contrairement à
 * `redeemVoucher`, aucun contrôle de transition n'est appliqué : c'est un
 * outil de correction réservé aux gestionnaires de contenu.
 */
export async function setVoucherStatus(id: string, status: GiftVoucherStatus) {
  const voucher = await getVoucherById(id);

  const data: Parameters<typeof prisma.giftVoucher.update>[0]["data"] = { status };

  if (status === "REDEEMED" && voucher.status !== "REDEEMED") {
    data.redeemedAt = new Date();
    // Pas de restaurant/agent associé : validation manuelle depuis l'admin,
    // pas un scan en salle.
    data.redeemedByUserId = null;
    data.redeemedAtRestaurantId = null;
  } else if (status !== "REDEEMED" && voucher.status === "REDEEMED") {
    data.redeemedAt = null;
    data.redeemedByUserId = null;
    data.redeemedAtRestaurantId = null;
  }

  if (status === "ACTIVE" && !voucher.purchasedAt) {
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setMonth(expiresAt.getMonth() + VALIDITY_MONTHS);
    data.purchasedAt = now;
    data.expiresAt = expiresAt;
  }

  return prisma.giftVoucher.update({ where: { id }, data });
}

export async function deleteVoucher(id: string) {
  await getVoucherById(id);
  await prisma.giftVoucher.delete({ where: { id } });
}

/** Génère le PDF du certificat pour un bon existant — téléchargement admin. */
export async function generateVoucherPdfById(id: string) {
  const voucher = await getVoucherById(id);
  const settings = await getSiteSettings();
  const isGift = Boolean(voucher.recipientEmail && voucher.recipientEmail !== voucher.buyerEmail);
  const expiryLabel = voucher.expiresAt
    ? voucher.expiresAt.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
    : null;

  const buffer = await generateVoucherPdf({
    amountLabel: (voucher.amountCents / 100).toFixed(2),
    code: voucher.code,
    expiryLabel,
    buyerName: voucher.buyerName,
    recipientName: isGift ? voucher.recipientName : null,
    logoUrl: settings.logo?.url ?? null,
    siteName: settings.siteName,
    contactEmail: settings.contactEmail,
  });

  return { buffer, voucher };
}

// ---------------------------------------------------------------------------
// Relances avant expiration
// ---------------------------------------------------------------------------

// Ordonnés du plus urgent au moins urgent : si un bon est éligible à
// plusieurs seuils en même temps (ex. tout premier passage du cron, bons
// déjà à quelques jours de l'échéance), on n'envoie qu'UNE relance — la plus
// urgente — et on marque les seuils moins urgents comme traités sans envoi,
// pour ne jamais spammer plusieurs mails le même jour pour le même bon.
const REMINDER_THRESHOLDS = [
  { field: "reminder7dSentAt", days: 7, label: "dans moins d'une semaine" },
  { field: "reminder1moSentAt", days: 30, label: "dans moins d'un mois" },
  { field: "reminder3moSentAt", days: 90, label: "dans moins de 3 mois" },
] as const satisfies readonly { field: "reminder7dSentAt" | "reminder1moSentAt" | "reminder3moSentAt"; days: number; label: string }[];

/**
 * Relance les bénéficiaires de bons actifs proches de l'expiration.
 * Idempotent (voir `reminder*SentAt`) — peut être appelée aussi souvent que
 * nécessaire par le déclencheur externe (cron), un seul envoi par seuil et
 * par bon. Retourne le nombre de mails envoyés, pour le suivi côté appelant.
 */
export async function sendExpiryReminders(): Promise<{ sent: number; checked: number }> {
  const now = new Date();
  const maxWindow = new Date(now);
  maxWindow.setDate(maxWindow.getDate() + REMINDER_THRESHOLDS[REMINDER_THRESHOLDS.length - 1]!.days);

  const candidates = await prisma.giftVoucher.findMany({
    where: {
      status: "ACTIVE",
      expiresAt: { gt: now, lte: maxWindow },
      OR: REMINDER_THRESHOLDS.map((t) => ({ [t.field]: null })),
    },
  });

  const settings = await getSiteSettings();
  let sent = 0;

  for (const voucher of candidates) {
    if (!voucher.expiresAt) continue;
    const daysLeft = (voucher.expiresAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000);
    const due = REMINDER_THRESHOLDS.filter((t) => daysLeft <= t.days && voucher[t.field] === null);
    if (due.length === 0) continue;

    const mostUrgent = due[0]!; // due.length > 0 vérifié juste au-dessus
    const data: Record<string, Date> = {};
    for (const t of due) data[t.field] = now;

    try {
      await sendVoucherReminderEmail(voucher, settings, mostUrgent.label);
      sent++;
    } catch (error) {
      console.error(`Relance bon cadeau ${voucher.code} échouée:`, error);
    }
    // Marqué traité même en cas d'échec d'envoi : on retentera au prochain
    // seuil plus urgent plutôt que de re-tenter en boucle sur celui-ci.
    await prisma.giftVoucher.update({ where: { id: voucher.id }, data });
  }

  return { sent, checked: candidates.length };
}

async function sendVoucherReminderEmail(
  voucher: { code: string; amountCents: number; buyerName: string; buyerEmail: string; recipientEmail: string | null; expiresAt: Date | null },
  settings: Awaited<ReturnType<typeof getSiteSettings>>,
  urgencyLabel: string
) {
  const amount = (voucher.amountCents / 100).toFixed(2);
  const to = voucher.recipientEmail || voucher.buyerEmail;
  const expiryLabel = voucher.expiresAt
    ? voucher.expiresAt.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
    : null;

  const bodyHtml = `
    <p style="margin:0 0 16px;">Bonjour,</p>
    <p style="margin:0 0 16px;">
      Votre bon cadeau de <strong>${amount} €</strong> (code <strong>${voucher.code}</strong>) expire ${urgencyLabel}${
        expiryLabel ? `, le <strong>${expiryLabel}</strong>` : ""
      }. Pensez à le présenter dans l'un des restaurants membres des ${settings.siteName} avant cette date.
    </p>
    ${emailButton("Voir les restaurants membres", absoluteUrl("/nos-restaurants"))}
  `;

  await sendMail({
    to,
    subject: `Votre bon cadeau expire ${urgencyLabel}`,
    text: `Votre bon cadeau de ${amount} € (code ${voucher.code}) expire ${urgencyLabel}${expiryLabel ? `, le ${expiryLabel}` : ""}. Utilisable dans n'importe lequel des restaurants membres des ${settings.siteName}.`,
    html: renderEmail({
      siteName: settings.siteName,
      preheader: `Votre bon cadeau de ${amount} € expire bientôt`,
      bodyHtml,
    }),
  });
}

// ---------------------------------------------------------------------------
// Trésorerie — versements aux restaurants
// ---------------------------------------------------------------------------

/**
 * Un restaurant qui valide un bon cadeau en salle avance sa valeur ; à
 * verser ensuite par l'association. Regroupe les bons REDEEMED par
 * restaurant, avec le total encore dû (payoutStatus = PENDING).
 */
export async function listRestaurantPayouts() {
  const redeemed = await prisma.giftVoucher.findMany({
    where: { status: "REDEEMED" },
    include: { redeemedAtRestaurant: { select: { id: true, name: true, slug: true } } },
    orderBy: { redeemedAt: "desc" },
  });

  const byRestaurant = new Map<
    string,
    {
      restaurantId: string;
      restaurantName: string;
      pendingCents: number;
      paidCents: number;
      vouchers: typeof redeemed;
    }
  >();

  for (const voucher of redeemed) {
    if (!voucher.redeemedAtRestaurant) continue; // ne devrait pas arriver pour un bon REDEEMED, garde défensive
    const key = voucher.redeemedAtRestaurant.id;
    const entry = byRestaurant.get(key) ?? {
      restaurantId: voucher.redeemedAtRestaurant.id,
      restaurantName: voucher.redeemedAtRestaurant.name,
      pendingCents: 0,
      paidCents: 0,
      vouchers: [] as typeof redeemed,
    };
    if (voucher.payoutStatus === "PAID") entry.paidCents += voucher.amountCents;
    else entry.pendingCents += voucher.amountCents;
    entry.vouchers.push(voucher);
    byRestaurant.set(key, entry);
  }

  return Array.from(byRestaurant.values()).sort((a, b) => b.pendingCents - a.pendingCents);
}

/** Change le statut de versement d'un bon donné (ADMIN ou TRESORIER). */
export async function setVoucherPayoutStatus(id: string, paid: boolean, actorUserId: string) {
  const voucher = await getVoucherById(id);
  if (voucher.status !== "REDEEMED") {
    throw new VoucherNotRedeemableError(voucher.status);
  }
  return prisma.giftVoucher.update({
    where: { id },
    data: paid
      ? { payoutStatus: "PAID", paidAt: new Date(), paidByUserId: actorUserId }
      : { payoutStatus: "PENDING", paidAt: null, paidByUserId: null },
  });
}

/** Marque en une fois tous les bons en attente de versement d'un restaurant. */
export async function markRestaurantPayoutsPaid(restaurantId: string, actorUserId: string) {
  const result = await prisma.giftVoucher.updateMany({
    where: { status: "REDEEMED", redeemedAtRestaurantId: restaurantId, payoutStatus: "PENDING" },
    data: { payoutStatus: "PAID", paidAt: new Date(), paidByUserId: actorUserId },
  });
  return result.count;
}

/** Statistiques bons cadeaux — utilisées par l'admin et l'espace trésorier. */
export async function getGiftVoucherStats() {
  const vouchers = await prisma.giftVoucher.findMany();

  const byStatus = { PENDING_PAYMENT: 0, ACTIVE: 0, REDEEMED: 0, EXPIRED: 0, CANCELLED: 0 } satisfies Record<GiftVoucherStatus, number>;
  let soldCents = 0; // ACTIVE + REDEEMED : bons effectivement payés
  let redeemedCents = 0;
  let pendingPayoutCents = 0;
  let paidPayoutCents = 0;

  for (const v of vouchers) {
    byStatus[v.status]++;
    if (v.status === "ACTIVE" || v.status === "REDEEMED") soldCents += v.amountCents;
    if (v.status === "REDEEMED") {
      redeemedCents += v.amountCents;
      if (v.payoutStatus === "PAID") paidPayoutCents += v.amountCents;
      else pendingPayoutCents += v.amountCents;
    }
  }

  return {
    total: vouchers.length,
    byStatus,
    soldCents,
    redeemedCents,
    pendingPayoutCents,
    paidPayoutCents,
  };
}
