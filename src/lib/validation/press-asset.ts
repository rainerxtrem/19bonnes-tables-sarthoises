import { z } from "zod";

export const pressAssetSchema = z.object({
  label: z.string().trim().min(1, "Libellé requis").max(120),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  mediaId: z.string().cuid("Choisissez un fichier"),
  order: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export type PressAssetInput = z.infer<typeof pressAssetSchema>;
