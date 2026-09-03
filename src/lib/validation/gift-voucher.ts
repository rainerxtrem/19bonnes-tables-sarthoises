import { z } from "zod";

// Montant en euros, borné pour éviter les erreurs de saisie et les abus
// (un bon à 1€ ou à 50 000€ n'a pas de sens ici).
export const giftVoucherPurchaseSchema = z.object({
  amount: z.coerce.number().min(10, "Montant minimum : 10 €").max(500, "Montant maximum : 500 €"),
  buyerName: z.string().trim().min(2, "Nom trop court").max(120),
  buyerEmail: z.string().trim().toLowerCase().email("Adresse email invalide"),
  recipientName: z.string().trim().max(120).optional().or(z.literal("")),
  recipientEmail: z.string().trim().toLowerCase().email("Adresse email invalide").optional().or(z.literal("")),
  message: z.string().trim().max(500).optional().or(z.literal("")),
  // Pot de miel anti-spam (voir contact/newsletter).
  website: z.string().optional().or(z.literal("")),
});

export type GiftVoucherPurchaseInput = z.infer<typeof giftVoucherPurchaseSchema>;

export const redeemVoucherSchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .transform((v) => v.replace(/\s+/g, "")),
});
