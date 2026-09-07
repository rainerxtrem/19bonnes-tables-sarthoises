import { z } from "zod";

export const faqItemSchema = z.object({
  question: z.string().trim().min(1, "Question requise").max(300),
  answer: z.string().trim().min(1, "Réponse requise").max(4000),
  order: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export type FaqItemInput = z.infer<typeof faqItemSchema>;
