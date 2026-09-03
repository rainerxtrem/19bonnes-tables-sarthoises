"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { giftVoucherPurchaseSchema } from "@/lib/validation/gift-voucher";
import { createVoucherCheckout } from "@/lib/services/gift-voucher.service";
import { checkRateLimit } from "@/lib/rate-limit";

export type GiftVoucherPurchaseState = { error?: string; fieldErrors?: Record<string, string[]> };

export async function purchaseVoucherAction(
  _prevState: GiftVoucherPurchaseState,
  formData: FormData
): Promise<GiftVoucherPurchaseState> {
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  if (!checkRateLimit(`gift-voucher:${ip}`, 5, 10 * 60 * 1000)) {
    return { error: "Trop de tentatives. Merci de réessayer dans quelques minutes." };
  }

  const parsed = giftVoucherPurchaseSchema.safeParse({
    amount: formData.get("amount"),
    buyerName: formData.get("buyerName"),
    buyerEmail: formData.get("buyerEmail"),
    // Les champs destinataire/message sont démontés du formulaire (pas
    // seulement masqués) quand "cadeau pour quelqu'un d'autre" n'est pas
    // coché — FormData.get() renvoie alors null, que le schéma (qui
    // n'accepte que undefined ou "") rejetterait. ?? "" normalise.
    recipientName: formData.get("recipientName") ?? "",
    recipientEmail: formData.get("recipientEmail") ?? "",
    message: formData.get("message") ?? "",
    website: formData.get("website"),
  });

  if (!parsed.success) {
    return { error: "Merci de corriger les champs indiqués.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  // Honeypot rempli => on ne crée rien, mais on ne prévient pas le bot.
  if (parsed.data.website) {
    redirect("/bon-cadeaux");
  }

  let checkoutUrl: string | null = null;
  try {
    const result = await createVoucherCheckout(parsed.data);
    checkoutUrl = result.checkoutUrl;
  } catch (error) {
    console.error("Création de la session de paiement échouée:", error);
  }

  if (!checkoutUrl) {
    return { error: "Le paiement n'est pas disponible pour le moment. Merci de réessayer plus tard." };
  }

  // redirect() doit être appelé hors du try/catch : il fonctionne en
  // levant une exception interne (NEXT_REDIRECT) qu'un catch englobant
  // intercepterait par erreur.
  redirect(checkoutUrl);
}
