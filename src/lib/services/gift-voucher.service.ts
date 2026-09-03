import QRCode from "qrcode";
import { prisma } from "@/lib/db/prisma";
import { getStripeClient } from "@/lib/stripe";
import { generateUniqueVoucherCode } from "@/lib/gift-voucher-code";
import { sendMail } from "@/lib/mailer";
import { renderEmail, emailButton } from "@/lib/email-template";
import { absoluteUrl } from "@/lib/seo";
import { getSiteSettings } from "@/lib/services/settings.service";
import type { GiftVoucherPurchaseInput } from "@/lib/validation/gift-voucher";

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

  await prisma.giftVoucher.update({
    where: { id: voucher.id },
    data: { stripeSessionId: session.id },
  });

  return { voucher, checkoutUrl: session.url };
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

  let qrDataUrl: string | null = null;
  try {
    qrDataUrl = await QRCode.toDataURL(voucher.code, { margin: 1, width: 220 });
  } catch (error) {
    console.error("Génération QR code échouée:", error);
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
    ${voucher.message ? `<p style="margin:0 0 16px; padding:14px; background-color:#faf6ee; border-radius:3px; font-style:italic;">« ${voucher.message} »</p>` : ""}
    <div style="text-align:center; margin:24px 0;">
      ${qrDataUrl ? `<img src="${qrDataUrl}" alt="QR code du bon cadeau" width="180" height="180" style="display:block; margin:0 auto 16px;" />` : ""}
      <p style="margin:0; font-family:monospace; font-size:20px; letter-spacing:1px; color:#231e1a; font-weight:bold;">${voucher.code}</p>
    </div>
    <p style="margin:0 0 8px; font-size:13px; color:#6f6455;">
      Présentez ce code (imprimé ou sur votre téléphone) directement au restaurant de votre choix parmi les membres de l'association.
      ${expiryLabel ? `Valable jusqu'au ${expiryLabel}.` : ""}
    </p>
    ${emailButton("Voir les restaurants membres", absoluteUrl("/nos-restaurants"))}
  `;

  await sendMail({
    to,
    subject: isGift ? `${voucher.buyerName} vous offre un bon cadeau !` : "Votre bon cadeau",
    text: `Votre bon cadeau de ${amount} € : ${voucher.code}\n\nUtilisable dans n'importe lequel des restaurants membres des ${settings.siteName}.${expiryLabel ? ` Valable jusqu'au ${expiryLabel}.` : ""}`,
    html: renderEmail({
      siteName: settings.siteName,
      preheader: `Votre bon cadeau de ${amount} € — code ${voucher.code}`,
      bodyHtml,
    }),
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
