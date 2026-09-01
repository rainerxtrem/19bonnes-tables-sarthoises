import { z } from "zod";

export const pageSchema = z.object({
  title: z.string().trim().min(2, "Titre trop court").max(200),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug invalide (minuscules, chiffres, tirets)")
    .optional(),
  content: z.string().trim().min(1, "Le contenu ne peut pas être vide"),
  excerpt: z.string().trim().max(300).optional().or(z.literal("")),
  mainImageId: z.string().cuid().optional().nullable(),
  ogImageId: z.string().cuid().optional().nullable(),
  status: z.enum(["DRAFT", "SCHEDULED", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  seoTitle: z.string().trim().max(70).optional().or(z.literal("")),
  seoDescription: z.string().trim().max(160).optional().or(z.literal("")),
});

export type PageInput = z.infer<typeof pageSchema>;
