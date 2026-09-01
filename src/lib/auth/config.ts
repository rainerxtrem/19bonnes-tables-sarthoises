import type { NextAuthConfig } from "next-auth";

/**
 * Config "edge-safe" : ne référence ni Prisma ni bcrypt (indisponibles en
 * runtime Edge). Utilisée par le middleware pour protéger /admin sans
 * toucher la base de données ; la config complète avec le provider
 * Credentials vit dans lib/auth/index.ts (runtime Node, utilisé par la
 * route API et les server components).
 */
export const authConfig: NextAuthConfig = {
  // Auth.js ne fait confiance automatiquement qu'à certains hôtes connus
  // (Vercel...). Railway (et tout hébergeur derrière un proxy inconnu
  // d'Auth.js) doit être explicitement approuvé, sinon toutes les requêtes
  // /api/auth/* échouent avec "UntrustedHost" — voir
  // https://errors.authjs.dev#untrustedhost. Sans risque ici : on ne route
  // que via NEXTAUTH_URL/le domaine configuré, pas un Host arbitraire.
  trustHost: true,
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 8,
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isAdminRoute = pathname.startsWith("/admin") && pathname !== "/admin/login";
      if (!isAdminRoute) return true;
      return Boolean(auth?.user);
    },
  },
};
