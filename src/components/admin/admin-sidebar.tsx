"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UtensilsCrossed,
  FileText,
  Newspaper,
  Tags,
  Image as ImageIcon,
  Users,
  Handshake,
  Gift,
  Wallet,
  Mail,
  Send,
  Menu,
  Route,
  Settings,
  ShieldCheck,
  ScrollText,
  X,
  HelpCircle,
  CalendarDays,
  Camera,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useMobileNav } from "@/components/admin/mobile-nav-context";
import type { Role } from "@prisma/client";

// Rôles autorisés à voir un item donné. Par défaut (non précisé) : gestion de
// contenu classique (SUPER_ADMIN + ADMIN) — c'était déjà le seul cas possible
// avant l'introduction du rôle SECRETAIRE, dont l'accès est volontairement
// étroit (voir GIFT_VOUCHER_ROLES/COMMUNICATION_ROLES dans
// lib/auth/permissions.ts, et le filtrage par chemin dans lib/auth/config.ts
// qui empêche de toute façon d'atteindre les autres pages).
type NavItem = { href: string; label: string; icon: LucideIcon; roles?: Role[] };
type NavGroup = { label?: string; items: NavItem[] };

const DEFAULT_ROLES: Role[] = ["SUPER_ADMIN", "ADMIN"];
const SUPER_ADMIN_ONLY: Role[] = ["SUPER_ADMIN"];
const GIFT_VOUCHER_ROLES: Role[] = ["SUPER_ADMIN", "ADMIN", "SECRETAIRE"];
const COMMUNICATION_ROLES: Role[] = ["SUPER_ADMIN", "ADMIN", "SECRETAIRE"];
const TREASURY_ROLES: Role[] = ["SUPER_ADMIN", "ADMIN", "TRESORIER"];

const NAV_GROUPS: NavGroup[] = [
  {
    items: [{ href: "/admin", label: "Tableau de bord", icon: LayoutDashboard }],
  },
  {
    label: "Contenu",
    items: [
      { href: "/admin/restaurants", label: "Restaurants", icon: UtensilsCrossed },
      { href: "/admin/pages", label: "Pages", icon: FileText },
      { href: "/admin/actualites", label: "Actualités", icon: Newspaper },
      { href: "/admin/evenements", label: "Événements", icon: CalendarDays },
      { href: "/admin/faq", label: "FAQ", icon: HelpCircle },
      { href: "/admin/categories", label: "Catégories", icon: Tags },
      { href: "/admin/galerie", label: "Galerie", icon: ImageIcon },
      { href: "/admin/presse", label: "Espace presse", icon: Camera },
    ],
  },
  {
    label: "Association",
    items: [
      { href: "/admin/bureau", label: "Bureau", icon: Users },
      { href: "/admin/partenaires", label: "Partenaires", icon: Handshake },
      { href: "/admin/bon-cadeaux", label: "Bons cadeaux", icon: Gift, roles: GIFT_VOUCHER_ROLES },
      { href: "/admin/tresorerie", label: "Trésorerie", icon: Wallet, roles: TREASURY_ROLES },
    ],
  },
  {
    label: "Communication",
    items: [
      { href: "/admin/messages", label: "Messages", icon: Mail, roles: COMMUNICATION_ROLES },
      { href: "/admin/newsletter", label: "Newsletter", icon: Send, roles: COMMUNICATION_ROLES },
    ],
  },
  {
    label: "Réglages",
    items: [
      { href: "/admin/navigation", label: "Navigation", icon: Menu },
      { href: "/admin/redirections", label: "Redirections", icon: Route, roles: SUPER_ADMIN_ONLY },
      { href: "/admin/settings", label: "Paramètres", icon: Settings, roles: SUPER_ADMIN_ONLY },
      { href: "/admin/administrateurs", label: "Administrateurs", icon: ShieldCheck, roles: SUPER_ADMIN_ONLY },
      { href: "/admin/journal", label: "Journal d'activité", icon: ScrollText, roles: SUPER_ADMIN_ONLY },
    ],
  },
];

export function AdminSidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const { open, setOpen } = useMobileNav();

  return (
    <>
      {/* Fond assombri derrière le tiroir — cliquer dessus le referme.
          Uniquement sous le seuil lg, où la sidebar passe en tiroir plutôt
          que de rester dans le flux normal de la page. */}
      {open ? (
        <div
          className="fixed inset-0 z-40 bg-ink-950/40 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      ) : null}

      <nav
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-full w-64 -translate-x-full flex-col gap-6 overflow-y-auto border-r border-ink-100 bg-white px-4 py-5 transition-transform duration-200",
          "lg:static lg:z-auto lg:translate-x-0",
          open && "translate-x-0"
        )}
      >
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-ink-950 font-display text-sm text-gold-400">
              19
            </span>
            <div className="leading-tight">
              <p className="font-display text-sm text-ink-900">Bonnes Tables</p>
              <p className="text-[11px] uppercase tracking-wide text-ink-400">Administration</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Fermer le menu"
            className="flex h-8 w-8 items-center justify-center rounded-sm text-ink-400 hover:bg-cream-100 lg:hidden"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        {NAV_GROUPS.map((group, groupIndex) => {
        const items = group.items.filter((item) => (item.roles ?? DEFAULT_ROLES).includes(role));
        if (items.length === 0) return null;

        return (
          <div key={group.label ?? `group-${groupIndex}`} className="flex flex-col gap-0.5">
            {group.label ? (
              <span className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wide text-ink-400">
                {group.label}
              </span>
            ) : null}
            {items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-sm border-l-2 border-transparent px-3 py-2 text-sm font-medium text-ink-600 transition-colors hover:bg-cream-100 hover:text-ink-900",
                    isActive && "border-wine-700 bg-wine-50 text-wine-700 hover:bg-wine-50 hover:text-wine-700"
                  )}
                >
                  <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-wine-700" : "text-ink-400")} aria-hidden />
                  {item.label}
                </Link>
              );
            })}
          </div>
        );
      })}
      </nav>
    </>
  );
}
