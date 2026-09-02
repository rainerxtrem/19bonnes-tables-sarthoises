"use server";

import { headers } from "next/headers";
import { after } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { contactFormSchema } from "@/lib/validation/contact";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendMail } from "@/lib/mailer";
import { renderEmail, escapeHtml } from "@/lib/email-template";
import { getSiteSettings } from "@/lib/services/settings.service";

export type ContactFormState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function submitContactForm(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  if (!checkRateLimit(`contact:${ip}`, 5, 10 * 60 * 1000)) {
    return { error: "Trop de tentatives. Merci de réessayer dans quelques minutes." };
  }

  const parsed = contactFormSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    subject: formData.get("subject"),
    message: formData.get("message"),
    consentGdpr: formData.get("consentGdpr") === "on",
    website: formData.get("website"), // honeypot
  });

  if (!parsed.success) {
    return { error: "Merci de corriger les champs indiqués.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  // Honeypot rempli => on fait croire que ça a marché sans rien enregistrer.
  if (parsed.data.website) {
    return { success: true };
  }

  const message = await prisma.contactMessage.create({
    data: {
      fullName: parsed.data.fullName,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      subject: parsed.data.subject || null,
      message: parsed.data.message,
      consentGdpr: parsed.data.consentGdpr,
      ipAddress: ip,
      userAgent: headerList.get("user-agent") ?? undefined,
    },
  });

  const notifyEmail = process.env.CONTACT_NOTIFICATION_EMAIL;
  if (notifyEmail) {
    // Planifié via after() : la réponse au formulaire part sans attendre
    // l'envoi, mais contrairement à un simple appel non attendu, after()
    // garantit que la promesse s'exécute jusqu'au bout même une fois la
    // réponse HTTP envoyée (Next.js peut sinon couper les fetch encore en
    // cours dès la fin du cycle de la requête).
    after(async () => {
      try {
        const settings = await getSiteSettings();
        const bodyHtml = `
          <p style="margin:0 0 16px;">Nouveau message reçu via le formulaire de contact du site :</p>
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 20px; font-size:14px;">
            <tr><td style="padding:4px 0; color:#6f6455; width:90px;">Nom</td><td style="padding:4px 0;"><strong>${escapeHtml(message.fullName)}</strong></td></tr>
            <tr><td style="padding:4px 0; color:#6f6455;">Email</td><td style="padding:4px 0;"><a href="mailto:${escapeHtml(message.email)}" style="color:#642227;">${escapeHtml(message.email)}</a></td></tr>
            ${message.phone ? `<tr><td style="padding:4px 0; color:#6f6455;">Téléphone</td><td style="padding:4px 0;">${escapeHtml(message.phone)}</td></tr>` : ""}
            <tr><td style="padding:4px 0; color:#6f6455;">Objet</td><td style="padding:4px 0;">${escapeHtml(message.subject ?? "—")}</td></tr>
          </table>
          <p style="margin:0 0 8px; padding:16px; background-color:#faf6ee; border-radius:3px; white-space:pre-wrap;">${escapeHtml(message.message)}</p>
        `;

        await sendMail({
          to: notifyEmail,
          subject: `Nouveau message de contact — ${message.fullName}`,
          text: `${message.fullName} (${message.email}${message.phone ? ", " + message.phone : ""})\nObjet: ${message.subject ?? "—"}\n\n${message.message}`,
          html: renderEmail({
            siteName: settings.siteName,
            preheader: `Nouveau message de ${message.fullName}`,
            bodyHtml,
          }),
        });
      } catch (error) {
        console.error("Envoi email contact échoué:", error);
      }
    });
  }

  return { success: true };
}
