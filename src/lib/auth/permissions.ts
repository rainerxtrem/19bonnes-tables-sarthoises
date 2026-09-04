import type { Role } from "@prisma/client";
import { auth } from "@/lib/auth";

/**
 * SUPER_ADMIN: accès total, y compris paramètres critiques et gestion des
 * administrateurs.
 * ADMIN: gestion des contenus (restaurants, pages, actualités, bureau,
 * partenaires, galerie, navigation, messages) mais pas des paramètres
 * critiques ni des comptes administrateurs.
 * RESTAURATEUR: gère uniquement sa propre fiche restaurant et sa propre
 * galerie depuis /mon-restaurant — jamais /admin (voir lib/auth/config.ts).
 */
const SETTINGS_ROLES: Role[] = ["SUPER_ADMIN"];
const CONTENT_ROLES: Role[] = ["SUPER_ADMIN", "ADMIN"];
// Trésorerie des bons cadeaux : accessible aux gestionnaires de contenu
// (l'admin doit pouvoir tout faire aussi, voir demande explicite) ET au
// rôle TRESORIER, dédié, qui n'a accès à rien d'autre du CMS.
const TREASURY_ROLES: Role[] = ["SUPER_ADMIN", "ADMIN", "TRESORIER"];

export class UnauthorizedError extends Error {
  constructor(message = "Authentification requise") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Permissions insuffisantes") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export async function requireSession() {
  const session = await auth();
  if (!session?.user) {
    throw new UnauthorizedError();
  }
  return session;
}

export async function requireContentAccess() {
  const session = await requireSession();
  if (!CONTENT_ROLES.includes(session.user.role)) {
    throw new ForbiddenError();
  }
  return session;
}

export async function requireSuperAdmin() {
  const session = await requireSession();
  if (!SETTINGS_ROLES.includes(session.user.role)) {
    throw new ForbiddenError();
  }
  return session;
}

/** Trésorerie : liste des versements dus aux restaurants + statistiques bons cadeaux. */
export async function requireTreasuryAccess() {
  const session = await requireSession();
  if (!TREASURY_ROLES.includes(session.user.role)) {
    throw new ForbiddenError();
  }
  return session;
}

/**
 * Un ADMIN/SUPER_ADMIN a accès à tout ; un RESTAURATEUR n'a accès qu'au
 * restaurant qui lui est assigné (`session.user.restaurantId`). À utiliser
 * pour toute route qui agit sur UN restaurant précis (fiche, galerie).
 */
export async function requireRestaurantAccess(restaurantId: string) {
  const session = await requireSession();
  if (CONTENT_ROLES.includes(session.user.role)) return session;
  if (session.user.role === "RESTAURATEUR" && session.user.restaurantId === restaurantId) {
    return session;
  }
  throw new ForbiddenError();
}

/**
 * Bons cadeaux : un bon est valable dans n'importe lequel des restaurants
 * membres, donc tout compte RESTAURATEUR (peu importe son propre
 * restaurant) peut consulter/valider n'importe quel bon depuis son espace.
 */
export async function requireRestaurateurSession() {
  const session = await requireSession();
  if (session.user.role === "RESTAURATEUR" && session.user.restaurantId) {
    return session;
  }
  throw new ForbiddenError();
}

/** Médiathèque : accessible aux gestionnaires de contenu ET aux restaurateurs
 * (ils doivent pouvoir uploader/choisir des photos pour leur propre fiche). */
export async function requireMediaAccess() {
  const session = await requireSession();
  if (CONTENT_ROLES.includes(session.user.role) || session.user.role === "RESTAURATEUR") {
    return session;
  }
  throw new ForbiddenError();
}
