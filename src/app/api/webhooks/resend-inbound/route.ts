import { NextResponse, type NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { verifySvixSignature } from "@/lib/webhooks/verify-svix";
import { parseContactMessageIdFromAddress } from "@/lib/contact-reply-address";
import { sendMail } from "@/lib/mailer";
import { renderEmail, escapeHtml, emailButton } from "@/lib/email-template";
import { getSiteSettings } from "@/lib/services/settings.service";
import { absoluteUrl } from "@/lib/seo";

/** Coupe grossièrement la citation du message précédent que la plupart des
 * clients mail ajoutent automatiquement sous une réponse ("Le ... a écrit :"
 * en français, "On ... wrote:" en anglais, ou un séparateur "-----Message
 * d'origine-----" côté Outlook) — pas une reconstruction fidèle du fil,
 * juste éviter d'afficher le message initial en double sous la réponse. */
function trimQuotedReply(text: string): string {
  const patterns = [/^Le .+ a écrit\s*:/m, /^On .+wrote:/m, /^-{2,}\s*Message d'origine\s*-{2,}/m, /^>{1,}/m];
  let cut = text.length;
  for (const pattern of patterns) {
    const match = pattern.exec(text);
    if (match && match.index < cut) cut = match.index;
  }
  return text.slice(0, cut).trim();
}

/** Repli minimal si le client n'a envoyé que du HTML (pas de version texte) —
 * suffisant pour un message de réponse simple, pas un rendu fidèle. */
function htmlToText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function POST(request: NextRequest) {
  const secret = process.env.RESEND_INBOUND_WEBHOOK_SECRET;
  if (!secret) {
    console.error("Webhook Resend Inbound : RESEND_INBOUND_WEBHOOK_SECRET manquant.");
    return NextResponse.json({ error: "Configuration manquante" }, { status: 500 });
  }

  const rawBody = await request.text();
  const ok = verifySvixSignature({
    secret,
    svixId: request.headers.get("svix-id"),
    svixTimestamp: request.headers.get("svix-timestamp"),
    svixSignature: request.headers.get("svix-signature"),
    rawBody,
  });
  if (!ok) {
    console.error("Webhook Resend Inbound : signature invalide.");
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  const payload = JSON.parse(rawBody) as {
    type: string;
    data?: { email_id?: string; to?: string[]; received_for?: string[]; from?: string };
  };

  if (payload.type !== "email.received" || !payload.data?.email_id) {
    return NextResponse.json({ received: true });
  }

  // L'adresse qui a effectivement déclenché la réception (received_for) est
  // plus fiable que "to" si le client a répondu à plusieurs destinataires.
  const candidateAddresses = [...(payload.data.received_for ?? []), ...(payload.data.to ?? [])];
  const contactMessageId = candidateAddresses
    .map(parseContactMessageIdFromAddress)
    .find((id): id is string => Boolean(id));

  if (!contactMessageId) {
    console.warn("Webhook Resend Inbound : aucune adresse msg-<id> reconnue.", candidateAddresses);
    return NextResponse.json({ received: true });
  }

  const original = await prisma.contactMessage.findUnique({ where: { id: contactMessageId } });
  if (!original) {
    console.warn("Webhook Resend Inbound : ContactMessage introuvable pour", contactMessageId);
    return NextResponse.json({ received: true });
  }

  // Contenu complet non inclus dans le payload du webhook (métadonnées
  // seulement) — récupéré via un second appel à l'API Resend.
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("Webhook Resend Inbound : RESEND_API_KEY manquant, impossible de récupérer le contenu.");
    return NextResponse.json({ error: "Configuration manquante" }, { status: 500 });
  }
  const emailRes = await fetch(`https://api.resend.com/emails/receiving/${payload.data.email_id}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!emailRes.ok) {
    console.error("Webhook Resend Inbound : échec récupération du contenu", emailRes.status);
    return NextResponse.json({ error: "Échec de récupération du contenu" }, { status: 502 });
  }
  const email = (await emailRes.json()) as { text?: string | null; html?: string | null; from?: string };

  const rawText = email.text?.trim() || (email.html ? htmlToText(email.html) : "");
  const body = trimQuotedReply(rawText) || "(message vide ou format non reconnu)";

  try {
    await prisma.contactMessageReply.create({
      data: {
        contactMessageId,
        direction: "CLIENT",
        body,
        fromEmail: email.from ?? payload.data.from ?? original.email,
        resendEmailId: payload.data.email_id,
      },
    });
  } catch (error) {
    // Rejeu du webhook (Resend retente sur non-2xx) : la contrainte unique
    // sur resendEmailId a déjà bloqué le doublon, rien à refaire.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ received: true });
    }
    throw error;
  }

  // Une réponse client rouvre le message, y compris s'il avait été archivé —
  // contrairement à une réponse de l'équipe, qui respecte l'archivage.
  await prisma.contactMessage.update({
    where: { id: contactMessageId },
    data: { status: "UNREAD", archivedAt: null },
  });

  const notifyEmail = process.env.CONTACT_NOTIFICATION_EMAIL;
  if (notifyEmail) {
    try {
      const settings = await getSiteSettings();
      const messagesUrl = absoluteUrl("/admin/messages");
      const bodyHtml = `
        <p style="margin:0 0 16px;">${escapeHtml(original.fullName)} a répondu à un message de contact :</p>
        <p style="margin:0 0 8px; padding:16px; background-color:#faf6ee; border-radius:3px; white-space:pre-wrap;">${escapeHtml(body)}</p>
        ${emailButton("Voir et répondre au message", messagesUrl)}
      `;
      await sendMail({
        to: notifyEmail,
        subject: `${original.fullName} a répondu à votre message`,
        text: `${original.fullName} a répondu à un message de contact :\n\n${body}\n\nRépondre : ${messagesUrl}`,
        html: renderEmail({ siteName: settings.siteName, preheader: "Nouvelle réponse d'un client", bodyHtml }),
      });
    } catch (error) {
      console.error("Notification de réponse client échouée:", error);
    }
  }

  return NextResponse.json({ received: true });
}
