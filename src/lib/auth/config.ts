import type { NextAuthConfig } from "next-auth";
import { NextResponse } from "next/server";

/**
 * Config "edge-safe" : ne référence ni Prisma ni bcrypt (indisponibles en
 * runtime Edge). Utilisée par le middleware pour protéger /admin et
 * /mon-restaurant sans toucher la base de données ; la config complète avec
 * le provider Credentials vit dans lib/auth/index.ts (runtime Node, utilisé
 * par la route API et les server components).
 */
export const authConfig: NextAuthConfig = {
  // Auth.js ne fait confiance automatiquement qu'à certains hôtes connus
  // (Vercel...). Railway (et tout hébergeur derrière un proxy inconnu
  // d'Auth.js) doit être explicitement approuvé, sinon toutes les requêtes
  // /api/auth/* échouent avec "UntrustedHost" — voir
  // https://errors.authjs.dev#untrustedhost. Sans risque ici : on ne route
  // que via NEXTAUTH_URL/le domaine configuré, pas un Host arbitraire.
  trustHost: true,
  // `pages.signIn` n'est qu'un repli générique : chaque zone protégée
  // (admin / restaurateur) redirige explicitement vers sa propre page de
  // connexion dans le callback `authorized` ci-dessous.
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
      if (isAdminRoute) {
        const role = auth?.user?.role;
        if (!auth?.user || (role !== "SUPER_ADMIN" && role !== "ADMIN")) {
          return NextResponse.redirect(new URL("/admin/login", request.url));
        }
        return true;
      }

      const isRestaurateurRoute = pathname.startsWith("/mon-restaurant") && pathname !== "/mon-restaurant/login";
      if (isRestaurateurRoute) {
        if (!auth?.user || auth.user.role !== "RESTAURATEUR" || !auth.user.restaurantId) {
          return NextResponse.redirect(new URL("/mon-restaurant/login", request.url));
        }
        return true;
      }

      return true;
    },
  },
};
