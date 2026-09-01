import { z } from "zod";

const openingSlotSchema = z.object({
  start: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Format attendu HH:MM"),
  end: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Format attendu HH:MM"),
});

const openingDaySchema = z.object({
  day: z.enum(["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"]),
  closed: z.boolean().default(false),
  slots: z.array(openingSlotSchema).default([]),
});

export const openingHoursSchema = z.array(openingDaySchema).max(7);

export const restaurantSchema = z.object({
  name: z.string().trim().min(2, "Nom trop court").max(200),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug invalide (minuscules, chiffres, tirets)")
    .optional(),
  shortDescription: z.string().trim().max(300).optional().or(z.literal("")),
  description: z.string().trim().max(20000).optional().or(z.literal("")),
  address: z.string().trim().max(200).optional().or(z.literal("")),
  postalCode: z
    .string()
    .trim()
    .regex(/^\d{5}$/, "Code postal invalide")
    .optional()
    .or(z.literal("")),
  city: z.string().trim().max(120).optional().or(z.literal("")),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+().\s-]{6,20}$/, "Téléphone invalide")
    .optional()
    .or(z.literal("")),
  email: z.string().trim().toLowerCase().email("Email invalide").optional().or(z.literal("")),
  website: z.string().trim().url("URL invalide").optional().or(z.literal("")),
  googleMapsUrl: z.string().trim().url("URL invalide").optional().or(z.literal("")),
  facebookUrl: z.string().trim().url("URL invalide").optional().or(z.literal("")),
  instagramUrl: z.string().trim().url("URL invalide").optional().or(z.literal("")),
  openingHours: openingHoursSchema.optional(),
  priceLunch: z.string().trim().max(40).optional().or(z.literal("")),
  priceDinner: z.string().trim().max(40).optional().or(z.literal("")),
  additionalInfo: z.string().trim().max(5000).optional().or(z.literal("")),
  mainImageId: z.string().cuid().optional().nullable(),
  ogImageId: z.string().cuid().optional().nullable(),
  order: z.coerce.number().int().min(0).default(0),
  isFeatured: z.boolean().default(false),
  status: z.enum(["DRAFT", "SCHEDULED", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  seoTitle: z.string().trim().max(70).optional().or(z.literal("")),
  seoDescription: z.string().trim().max(160).optional().or(z.literal("")),
  galleryMediaIds: z.array(z.string().cuid()).optional(),
});

export type RestaurantInput = z.infer<typeof restaurantSchema>;

export const reorderSchema = z.object({
  items: z.array(z.object({ id: z.string().cuid(), order: z.number().int().min(0) })).min(1),
});
