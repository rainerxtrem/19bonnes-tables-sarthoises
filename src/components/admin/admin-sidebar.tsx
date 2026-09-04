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
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Role } from "@prisma/client";

type NavItem = { href: string; label: string; icon: LucideIcon; superAdminOnly?: boolean };
type NavGroup = { label?: string; items: NavItem[] };

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
      { href: "/admin/categories", label: "Catégories", icon: Tags },
      { href: "/admin/galerie", label: "Galerie", icon: ImageIcon },
    ],
  },
  {
    label: "Association",
    items: [
      { href: "/admin/bureau", label: "Bureau", icon: Users },
      { href: "/admin/partenaires", label: "Partenaires", icon: Handshake },
      { href: "/admin/bon-cadeaux", label: "Bons cadeaux", icon: Gift },
      { href: "/admin/tresorerie", label: "Trésorerie", icon: Wallet },
    ],
  },
  {
    label: "Communication",
    items: [
      { href: "/admin/messages", label: "Messages", icon: Mail },
      { href: "/admin/newsletter", label: "Newsletter", icon: Send },
    ],
  },
  {
    label: "Réglages",
    items: [
      { href: "/admin/navigation", label: "Navigation", icon: Menu },
      { href: "/admin/redirections", label: "Redirections", icon: Route, superAdminOnly: true },
      { href: "/admin/settings", label: "Paramètres", icon: Settings, superAdminOnly: true },
      { href: "/admin/administrateurs", label: "Administrateurs", icon: ShieldCheck, superAdminOnly: true },
    ],
  },
];

export function AdminSidebar({ role }: { role: Role }) {
  const pathname = usePathname();

  return (
    <nav className="flex h-full w-64 flex-col gap-6 overflow-y-auto border-r border-ink-100 bg-white px-4 py-5">
      <div className="flex items-center gap-2.5 px-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-ink-950 font-display text-sm text-gold-400">
          19
        </span>
        <div className="leading-tight">
          <p className="font-display text-sm text-ink-900">Bonnes Tables</p>
          <p className="text-[11px] uppercase tracking-wide text-ink-400">Administration</p>
        </div>
      </div>

      {NAV_GROUPS.map((group, groupIndex) => {
        const items = group.items.filter((item) => !item.superAdminOnly || role === "SUPER_ADMIN");
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
  );
}
