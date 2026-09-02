"use server";

import { headers } from "next/headers";
import { newsletterSubscribeSchema } from "@/lib/validation/newsletter";
import { subscribeToNewsletter, AlreadySubscribedError } from "@/lib/services/newsletter.service";
import { checkRateLimit } from "@/lib/rate-limit";

export type NewsletterState = { success?: boolean; error?: string };

export async function subscribeAction(
  _prevState: NewsletterState,
  formData: FormData
): Promise<NewsletterState> {
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  if (!checkRateLimit(`newsletter:${ip}`, 5, 10 * 60 * 1000)) {
    return { error: "Trop de tentatives. Merci de réessayer dans quelques minutes." };
  }

  const parsed = newsletterSubscribeSchema.safeParse({
    email: formData.get("email"),
    consent: formData.get("consent") === "on",
    website: formData.get("website"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Adresse email invalide." };
  }

  // Pot de miel rempli => faux succès silencieux.
  if (parsed.data.website) {
    return { success: true };
  }

  try {
    await subscribeToNewsletter(parsed.data.email, ip);
    return { success: true };
  } catch (error) {
    if (error instanceof AlreadySubscribedError) {
      return { error: error.message };
    }
    console.error("Inscription newsletter échouée:", error);
    return { error: "Une erreur est survenue. Merci de réessayer." };
  }
}
