import { z } from "zod";

export const newsletterSubscribeSchema = z.object({
  email: z.string().trim().toLowerCase().email("Adresse email invalide"),
  consent: z.literal(true, {
    errorMap: () => ({ message: "Vous devez accepter de recevoir la newsletter" }),
  }),
  // Pot de miel anti-spam (voir contact form) — ne fait pas échouer la
  // validation ici, vérifié après coup pour renvoyer un faux succès.
  website: z.string().optional().or(z.literal("")),
});

export type NewsletterSubscribeInput = z.infer<typeof newsletterSubscribeSchema>;
