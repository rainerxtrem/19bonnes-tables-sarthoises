import { z } from "zod";

export const navigationItemSchema = z
  .object({
    label: z.string().trim().min(1, "Libellé requis").max(80),
    linkType: z.enum(["INTERNAL", "EXTERNAL"]),
    url: z.string().trim().max(500).optional().or(z.literal("")),
    pageId: z.string().cuid().optional().nullable(),
    parentId: z.string().cuid().optional().nullable(),
    order: z.coerce.number().int().min(0).default(0),
    isActive: z.boolean().default(true),
    openInNewTab: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    if (data.linkType === "EXTERNAL" && !data.url) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "URL requise pour un lien externe",
        path: ["url"],
      });
    }
    if (data.linkType === "INTERNAL" && !data.pageId && !data.url) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Choisissez une page interne ou saisissez un chemin",
        path: ["pageId"],
      });
    }
  });

export type NavigationItemInput = z.infer<typeof navigationItemSchema>;

export const reorderNavigationSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().cuid(),
        order: z.number().int().min(0),
        parentId: z.string().cuid().nullable(),
      })
    )
    .min(1),
});
