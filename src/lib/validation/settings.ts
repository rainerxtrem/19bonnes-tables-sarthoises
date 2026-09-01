import { z } from "zod";

export const siteSettingSchema = z.object({
  siteName: z.string().trim().min(2).max(150),
  siteDescription: z.string().trim().max(500).optional().or(z.literal("")),
  logoId: z.string().cuid().optional().nullable(),
  faviconId: z.string().cuid().optional().nullable(),
  contactEmail: z.string().trim().toLowerCase().email().optional().or(z.literal("")),
  contactPhone: z
    .string()
    .trim()
    .regex(/^[0-9+().\s-]{6,20}$/)
    .optional()
    .or(z.literal("")),
  address: z.string().trim().max(300).optional().or(z.literal("")),
  facebookUrl: z.string().trim().url().optional().or(z.literal("")),
  instagramUrl: z.string().trim().url().optional().or(z.literal("")),
  linkedinUrl: z.string().trim().url().optional().or(z.literal("")),
  seoDefaultTitle: z.string().trim().max(70).optional().or(z.literal("")),
  seoDefaultDescription: z.string().trim().max(160).optional().or(z.literal("")),
  ogDefaultImageId: z.string().cuid().optional().nullable(),
  footerText: z.string().trim().max(2000).optional().or(z.literal("")),
  gtmId: z.string().trim().max(40).optional().or(z.literal("")),
});

export type SiteSettingInput = z.infer<typeof siteSettingSchema>;
