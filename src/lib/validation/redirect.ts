import { z } from "zod";

export const redirectSchema = z.object({
  fromPath: z
    .string()
    .trim()
    .regex(/^\//, "Le chemin doit commencer par /")
    .max(500),
  toPath: z.string().trim().min(1).max(500),
  statusCode: z.coerce.number().int().refine((v) => v === 301 || v === 302, {
    message: "Code HTTP doit être 301 ou 302",
  }),
  isActive: z.boolean().default(true),
});

export type RedirectInput = z.infer<typeof redirectSchema>;
