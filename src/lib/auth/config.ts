import type { NextAuthConfig } from "next-auth";
import { NextResponse } from "next/server";
import type { Role } from "@prisma/client";

/**
 * Config "edge-safe" : ne référence ni Prisma ni bcrypt à l'exécution
 * (indisponibles en runtime Edge) — seul un `import type` de `Role` est
 * utilisé, entièrement supprimé à la compilation. Utilisée par le
 * middleware pour protéger /admin et /mon-restaurant sans toucher la base
 * de données ; la config complète avec le provider Credentials vit dans
 * lib/auth/index.ts (runtime Node, utilisé par la route API et les server
 * components), en réutilisant exactement ces mêmes callbacks.
 *
 * Important : jwt/session doivent être définis ICI (et pas seulement dans
 * index.ts) sinon le middleware — qui n'utilise QUE cette config — ne voit
 * jamais `role`/`restaurantId` sur la session, et tout contrôle de rôle au
 * niveau du middleware échoue silencieusement pour tout le monde.
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
    // 180 jours plutôt que 8h : l'espace restaurateur (tablette de salle,
    // validation des bons cadeaux) doit rester connecté durablement — pas
    // de reconnexion en plein service. Auth.js écrit la durée du cookie de
    // session à partir de CETTE seule valeur globale, sans jamais la faire
    // varier selon le rôle du token (vérifié dans le code source
    // @auth/core — le callback jwt n'a aucune prise dessus) : impossible
    // d'avoir un maxAge court pour /admin et long pour /mon-restaurant sans
    // réécrire nous-mêmes la gestion du cookie de session. Ce choix
    // s'applique donc à tous les espaces (admin, trésorerie, restaurateur).
    // La déconnexion explicite (bouton dédié) reste possible à tout moment.
    maxAge: 60 * 60 * 24 * 180,
  },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
        token.restaurantId = (user as { restaurantId?: string | null }).restaurantId ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as Role;
      session.user.restaurantId = token.restaurantId as string | null;
      return session;
    },
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

      const isTreasuryRoute = pathname.startsWith("/tresorerie") && pathname !== "/tresorerie/login";
      if (isTreasuryRoute) {
        if (!auth?.user || auth.user.role !== "TRESORIER") {
          return NextResponse.redirect(new URL("/tresorerie/login", request.url));
        }
        return true;
      }

      return true;
    },
  },
};
