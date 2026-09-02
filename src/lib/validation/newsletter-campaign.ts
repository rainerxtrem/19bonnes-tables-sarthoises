import { z } from "zod";

export const newsletterCampaignSchema = z.object({
  subject: z.string().trim().min(3, "Objet trop court").max(150),
  introText: z.string().trim().min(10, "Message trop court").max(5000),
  articleId: z.string().cuid().optional().nullable(),
});

export type NewsletterCampaignInput = z.infer<typeof newsletterCampaignSchema>;
