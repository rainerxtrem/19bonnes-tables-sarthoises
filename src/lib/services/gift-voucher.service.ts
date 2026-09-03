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
 * Carte-cadeau façon "certificat" — cadre doré, sceau, montant encadré,
 * QR code — pensée table-based / styles inline pour rester fiable dans les
 * clients mail (pas de web font custom ni de dégradé CSS, juste une pile de
 * polices serif classiques ; le double-cadre utilise `border-style:double`,
 * du CSS simple bien supporté partout).
 */
function renderVoucherCertificateHtml(params: {
  logoUrl: string | null;
  amountLabel: string;
  code: string;
  qrImageUrl: string;
  expiryLabel: string | null;
  offeredByLabel: string | null;
  messageQuote: string | null;
}): string {
  const { logoUrl, amountLabel, code, qrImageUrl, expiryLabel, offeredByLabel, messageQuote } = params;
  const serif = "Georgia, 'Times New Roman', serif";

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px; background-color:#fdfbf6; border:1px solid #cdb98c;">
            <tr>
              <td style="border:3px double #ecdfc2; padding:32px 28px; text-align:center;">
                ${
                  logoUrl
                    ? `<img src="${logoUrl}" width="64" height="64" alt="" style="display:inline-block; width:64px; height:64px; border-radius:50%; border:3px solid #fdfbf6; outline:1px solid #d8c79c; object-fit:cover;" />`
                    : `<div style="display:inline-block; width:64px; height:64px; line-height:64px; border-radius:50%; background-color:#2b2419; color:#e6d6ae; font-family:${serif}; font-size:20px; font-weight:bold;">19</div>`
                }

                <div style="margin:18px auto 6px; width:60px; border-top:1px solid #cdb98c;"></div>
                <p style="margin:0 0 18px; font-size:9px; letter-spacing:3px; text-transform:uppercase; color:#a08a5e; font-weight:bold;">Association des 19 Bonnes Tables Sarthoises</p>

                <p style="margin:0 0 4px; font-family:${serif}; font-size:38px; line-height:1.1; color:#2b2419;">Bon cadeau</p>
                <p style="margin:0 0 22px; font-size:10px; letter-spacing:2px; text-transform:uppercase; color:#a08a5e; font-weight:bold;">Valable dans n'importe lequel des 19 restaurants membres</p>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:2px solid #8a6a2f; border-bottom:2px solid #8a6a2f; margin:0 0 22px;">
                  <tr>
                    <td align="center" style="padding:14px 0; background-color:#f4ebd7;">
                      <span style="font-family:${serif}; font-size:44px; font-weight:bold; color:#8a6a2f;">${amountLabel}</span>
                      <span style="font-family:${serif}; font-size:24px; color:#8a6a2f;"> €</span>
                    </td>
                  </tr>
                </table>

                ${
                  offeredByLabel
                    ? `<p style="margin:0 0 18px; font-size:13px; font-style:italic; color:#5c5240;">Offert par ${offeredByLabel}</p>`
                    : ""
                }
                ${
                  messageQuote
                    ? `<p style="margin:0 0 22px; padding:14px 16px; background-color:#f4efe3; font-size:13px; font-style:italic; color:#5c5240;">« ${messageQuote} »</p>`
                    : ""
                }

                <div style="margin:0 0 20px; height:1px; background-color:#eee6d5;"></div>

                <img src="${qrImageUrl}" alt="QR code du bon cadeau" width="140" height="140" style="display:block; margin:0 auto 14px; border:0;" />
                <p style="margin:0 0 4px; font-family:'Courier New', monospace; font-size:19px; letter-spacing:2px; color:#2b2419; font-weight:bold;">${code}</p>
                <p style="margin:0; font-size:9px; letter-spacing:2px; text-transform:uppercase; color:#b3a17c; font-weight:bold;">N° de série</p>

                ${
                  expiryLabel
                    ? `<p style="margin:18px 0 0; font-size:11px; color:#8d8471;">Valable jusqu'au <strong style="color:#2b2419;">${expiryLabel}</strong></p>`
                    : ""
                }
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
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

  // Image PNG servie depuis notre propre route (voir
  // /api/gift-vouchers/[code]/qr) plutôt qu'en data: URI intégré au HTML :
  // plusieurs clients mail (Gmail, Outlook selon les cas) bloquent
  // silencieusement les images en data: URI, alors qu'une vraie URL
  // http(s) s'affiche de façon fiable partout.
  const qrImageUrl = absoluteUrl(`/api/gift-vouchers/${voucher.code}/qr`);
  const logoUrl = settings.logo?.url ?? null;

  const bodyHtml = `
    <p style="margin:0 0 16px;">Bonjour${isGift && voucher.recipientName ? " " + voucher.recipientName : ""},</p>
    <p style="margin:0 0 16px;">
      ${
        isGift
          ? `<strong>${voucher.buyerName}</strong> vous offre un bon cadeau de <strong>${amount} €</strong> à utiliser dans l'un des restaurants membres des ${settings.siteName} !`
          : `Merci pour votre achat ! Voici votre bon cadeau de <strong>${amount} €</strong>, utilisable dans n'importe lequel des restaurants membres des ${settings.siteName}.`
      }
    </p>
    ${renderVoucherCertificateHtml({
      logoUrl,
      amountLabel: amount,
      code: voucher.code,
      qrImageUrl,
      expiryLabel,
      offeredByLabel: isGift ? voucher.buyerName : null,
      messageQuote: isGift ? voucher.message : null,
    })}
    <p style="margin:0 0 8px; font-size:13px; color:#6f6455;">
      Présentez ce code (imprimé ou sur votre téléphone) directement au restaurant de votre choix parmi les membres de l'association.
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
