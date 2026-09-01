import { z } from "zod";

export const articleSchema = z.object({
  title: z.string().trim().min(2, "Titre trop court").max(200),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug invalide (minuscules, chiffres, tirets)")
    .optional(),
  excerpt: z.string().trim().max(300).optional().or(z.literal("")),
  content: z.string().trim().min(1, "Le contenu ne peut pas être vide"),
  mainImageId: z.string().cuid().optional().nullable(),
  ogImageId: z.string().cuid().optional().nullable(),
  categoryId: z.string().cuid().optional().nullable(),
  tags: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
  status: z.enum(["DRAFT", "SCHEDULED", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  scheduledFor: z.coerce.date().optional().nullable(),
  seoTitle: z.string().trim().max(70).optional().or(z.literal("")),
  seoDescription: z.string().trim().max(160).optional().or(z.literal("")),
});

export type ArticleInput = z.infer<typeof articleSchema>;

export const categorySchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug invalide")
    .optional(),
});
