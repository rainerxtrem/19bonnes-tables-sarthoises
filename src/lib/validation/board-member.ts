import { z } from "zod";

export const boardMemberSchema = z.object({
  firstName: z.string().trim().min(1, "Prénom requis").max(80),
  lastName: z.string().trim().min(1, "Nom requis").max(80),
  role: z.string().trim().min(2, "Fonction requise").max(120),
  restaurantId: z.string().cuid().optional().nullable(),
  photoId: z.string().cuid().optional().nullable(),
  bio: z.string().trim().max(3000).optional().or(z.literal("")),
  order: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export type BoardMemberInput = z.infer<typeof boardMemberSchema>;
