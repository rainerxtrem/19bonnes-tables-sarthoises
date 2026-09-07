import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Adresse email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const createUserSchema = z
  .object({
    name: z.string().trim().min(2, "Nom trop court").max(120),
    email: z.string().trim().toLowerCase().email("Adresse email invalide"),
    password: z
      .string()
      .min(12, "Le mot de passe doit contenir au moins 12 caractères")
      .regex(/[a-z]/, "Le mot de passe doit contenir une minuscule")
      .regex(/[A-Z]/, "Le mot de passe doit contenir une majuscule")
      .regex(/[0-9]/, "Le mot de passe doit contenir un chiffre"),
    role: z.enum(["SUPER_ADMIN", "ADMIN", "RESTAURATEUR", "TRESORIER", "SECRETAIRE"]),
    // Requis uniquement pour un compte RESTAURATEUR — voir superRefine.
    restaurantId: z.string().cuid().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.role === "RESTAURATEUR" && !data.restaurantId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Choisissez le restaurant que ce compte doit gérer",
        path: ["restaurantId"],
      });
    }
  });

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = z
  .object({
    name: z.string().trim().min(2, "Nom trop court").max(120),
    email: z.string().trim().toLowerCase().email("Adresse email invalide"),
    password: createUserSchema.innerType().shape.password.optional(),
    role: z.enum(["SUPER_ADMIN", "ADMIN", "RESTAURATEUR", "TRESORIER", "SECRETAIRE"]),
    restaurantId: z.string().cuid().optional().nullable(),
    isActive: z.boolean(),
  })
  .partial({ name: true, email: true, role: true, isActive: true, restaurantId: true });

// Schéma du formulaire d'édition côté admin (/admin/administrateurs) — pas le
// même objet que updateUserSchema ci-dessus (qui décrit ce que l'API accepte,
// tout optionnel) : ici tous les champs sont affichés dans le formulaire,
// mais le mot de passe peut rester vide ("ne pas changer") ; UserManager
// retire alors la clé `password` avant l'envoi plutôt que d'envoyer "".
export const adminEditUserSchema = z
  .object({
    name: z.string().trim().min(2, "Nom trop court").max(120),
    email: z.string().trim().toLowerCase().email("Adresse email invalide"),
    password: z.union([z.literal(""), createUserSchema.innerType().shape.password]),
    role: z.enum(["SUPER_ADMIN", "ADMIN", "RESTAURATEUR", "TRESORIER", "SECRETAIRE"]),
    restaurantId: z.string().cuid().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.role === "RESTAURATEUR" && !data.restaurantId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Choisissez le restaurant que ce compte doit gérer",
        path: ["restaurantId"],
      });
    }
  });

export type AdminEditUserInput = z.infer<typeof adminEditUserSchema>;