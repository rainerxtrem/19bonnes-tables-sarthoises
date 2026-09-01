import { z } from "zod";

export const contactFormSchema = z.object({
  fullName: z.string().trim().min(2, "Nom trop court").max(150),
  email: z.string().trim().toLowerCase().email("Adresse email invalide"),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+().\s-]{6,20}$/, "Numéro de téléphone invalide")
    .optional()
    .or(z.literal("")),
  subject: z.string().trim().max(200).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Message trop court").max(5000),
  consentGdpr: z.literal(true, {
    errorMap: () => ({ message: "Vous devez accepter que votre demande soit enregistrée" }),
  }),
  // Honeypot : champ invisible pour les humains, doit rester vide. On
  // n'échoue pas la validation ici (sinon un bot verrait une erreur et
  // ajusterait son comportement) — le remplissage est vérifié après coup
  // dans l'action pour renvoyer un faux succès silencieux.
  website: z.string().optional().or(z.literal("")),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;
