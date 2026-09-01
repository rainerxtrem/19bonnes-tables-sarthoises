import type { NextAuthConfig } from "next-auth";

/**
 * Config "edge-safe" : ne référence ni Prisma ni bcrypt (indisponibles en
 * runtime Edge). Utilisée par le middleware pour protéger /admin sans
 * toucher la base de données ; la config complète avec le provider
 * Credentials vit dans lib/auth/index.ts (runtime Node, utilisé par la
 * route API et les server components).
 */
export const authConfig: NextAuthConfig = {
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
