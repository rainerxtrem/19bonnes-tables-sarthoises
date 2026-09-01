import { z } from "zod";

export const galleryAlbumSchema = z.object({
  title: z.string().trim().min(2).max(150),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug invalide")
    .optional(),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  restaurantId: z.string().cuid().optional().nullable(),
  order: z.coerce.number().int().min(0).default(0),
});

export type GalleryAlbumInput = z.infer<typeof galleryAlbumSchema>;

export const addGalleryItemsSchema = z.object({
  mediaIds: z.array(z.string().cuid()).min(1),
});

export const reorderGalleryItemsSchema = z.object({
  items: z.array(z.object({ id: z.string().cuid(), order: z.number().int().min(0) })).min(1),
});
