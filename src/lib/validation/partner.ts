import { z } from "zod";

export const partnerSchema = z.object({
  name: z.string().trim().min(1, "Nom requis").max(120),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  websiteUrl: z.string().trim().url("URL invalide").optional().or(z.literal("")),
  logoId: z.string().cuid().optional().nullable(),
  order: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export type PartnerInput = z.infer<typeof partnerSchema>;
