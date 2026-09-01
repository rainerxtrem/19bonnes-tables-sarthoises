"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { contactFormSchema } from "@/lib/validation/contact";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendMail } from "@/lib/mailer";

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
    await sendMail({
      to: notifyEmail,
      subject: `Nouveau message de contact — ${message.fullName}`,
      text: `${message.fullName} (${message.email}${message.phone ? ", " + message.phone : ""})\nObjet: ${message.subject ?? "—"}\n\n${message.message}`,
    }).catch((error) => console.error("Envoi email contact échoué:", error));
  }

  return { success: true };
}
