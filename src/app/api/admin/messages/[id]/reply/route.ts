import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireCommunicationAccess } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api/handle-error";
import { prisma } from "@/lib/db/prisma";
import { recordAuditLog } from "@/lib/services/audit-log.service";
import { sendMail } from "@/lib/mailer";
import { renderEmail, escapeHtml, textToParagraphsHtml } from "@/lib/email-template";
import { getSiteSettings } from "@/lib/services/settings.service";
import { buildInboundReplyAddress } from "@/lib/contact-reply-address";

const bodySchema = z.object({
  replyMessage: z.string().trim().min(2, "La réponse est trop courte").max(5000),
});

type Params = { params: Promise<{ id: string }> };

/** Réponse envoyée depuis /admin/messages : email au client + entrée dans le
 * fil de discussion (ContactMessageReply, direction STAFF). Le Reply-To est
 * une adresse dédiée (voir contact-reply-address.ts) : si le client répond
 * à son tour, Resend Inbound la capture automatiquement (voir
 * /api/webhooks/resend-inbound) — pas besoin de consulter une boîte mail. */
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const session = await requireCommunicationAccess();
    const { id } = await params;
    const { replyMessage } = bodySchema.parse(await request.json());

    const original = await prisma.contactMessage.findUnique({ where: { id } });
    if (!original) {
      return NextResponse.json({ error: "Message introuvable" }, { status: 404 });
    }

    const settings = await getSiteSettings();
    const replyTo = buildInboundReplyAddress(id) ?? undefined;
    const bodyHtml = `
      <p style="margin:0 0 16px;">Bonjour ${escapeHtml(original.fullName)},</p>
      ${textToParagraphsHtml(replyMessage)}
      <p style="margin:24px 0 8px; padding-top:16px; border-top:1px solid #f3ecdb; font-size:13px; color:#8f8271;">Votre message initial :</p>
      <p style="margin:0; padding:12px; background-color:#faf6ee; border-radius:3px; font-size:13px; color:#6f6455; white-space:pre-wrap;">${escapeHtml(original.message)}</p>
    `;

    await sendMail({
      to: original.email,
      subject: original.subject ? `Re: ${original.subject}` : "Réponse à votre message",
      text: `Bonjour ${original.fullName},\n\n${replyMessage}\n\n---\nVotre message initial :\n${original.message}`,
      html: renderEmail({
        siteName: settings.siteName,
        preheader: `Réponse à votre message du ${original.createdAt.toLocaleDateString("fr-FR")}`,
        bodyHtml,
      }),
      replyTo,
    });

    const [reply, message] = await prisma.$transaction([
      prisma.contactMessageReply.create({
        data: {
          contactMessageId: id,
          direction: "STAFF",
          body: replyMessage,
          authorUserId: session.user.id,
        },
      }),
      prisma.contactMessage.update({
        where: { id },
        data: {
          // La réponse implique que le message a été lu ; on ne désarchive
          // pas pour autant un message déjà classé.
          status: original.status === "ARCHIVED" ? "ARCHIVED" : "READ",
          readAt: original.readAt ?? new Date(),
        },
      }),
    ]);

    await recordAuditLog({
      userId: session.user.id,
      action: "contact-message.reply",
      entityType: "ContactMessage",
      entityId: id,
    });

    return NextResponse.json({
      message: { ...message, reply: { ...reply, authorName: session.user.name } },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
