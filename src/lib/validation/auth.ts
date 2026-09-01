import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Adresse email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const createUserSchema = z.object({
  name: z.string().trim().min(2, "Nom trop court").max(120),
  email: z.string().trim().toLowerCase().email("Adresse email invalide"),
  password: z
    .string()
    .min(12, "Le mot de passe doit contenir au moins 12 caractères")
    .regex(/[a-z]/, "Le mot de passe doit contenir une minuscule")
    .regex(/[A-Z]/, "Le mot de passe doit contenir une majuscule")
    .regex(/[0-9]/, "Le mot de passe doit contenir un chiffre"),
  role: z.enum(["SUPER_ADMIN", "ADMIN"]),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = createUserSchema
  .omit({ password: true })
  .extend({
    password: createUserSchema.shape.password.optional(),
    isActive: z.boolean(),
  })
  .partial({ name: true, email: true, role: true, isActive: true });
