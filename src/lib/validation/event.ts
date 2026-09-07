import { z } from "zod";

export const eventSchema = z
  .object({
    title: z.string().trim().min(1, "Titre requis").max(200),
    description: z.string().trim().max(4000).optional().or(z.literal("")),
    startAt: z.coerce.date({ errorMap: () => ({ message: "Date de début invalide" }) }),
    endAt: z.coerce.date().optional().nullable(),
    location: z.string().trim().max(200).optional().or(z.literal("")),
    mainImageId: z.string().cuid().optional().nullable(),
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  })
  .refine((data) => !data.endAt || data.endAt >= data.startAt, {
    message: "La date de fin doit être après la date de début",
    path: ["endAt"],
  });

export type EventInput = z.infer<typeof eventSchema>;
