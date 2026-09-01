import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { loginSchema } from "@/lib/validation/auth";
import { authConfig } from "@/lib/auth/config";
// L'augmentation de types "next-auth" / "next-auth/jwt" vit dans
// src/types/next-auth.d.ts et est chargée automatiquement par tsconfig
// (include: "**/*.ts") — pas besoin de l'importer ici (un import runtime
// ferait échouer le bundling webpack, ce fichier n'existant qu'à la
// compilation).
//
// Les callbacks jwt/session/authorized vivent dans authConfig (voir
// lib/auth/config.ts) et sont réutilisés tels quels ici via le spread
// ci-dessous — c'est cette config, edge-safe, qui est aussi utilisée par le
// middleware. Ne pas les redéfinir ici séparément : le middleware n'a accès
// qu'à authConfig, donc toute logique jwt/session ajoutée uniquement ici
// serait invisible pour lui (voir le commentaire dans config.ts).

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(rawCredentials) {
        const parsed = loginSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.isActive) return null;

        const isValidPassword = await bcrypt.compare(password, user.passwordHash);
        if (!isValidPassword) return null;

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          restaurantId: user.restaurantId,
        };
      },
    }),
  ],
});
