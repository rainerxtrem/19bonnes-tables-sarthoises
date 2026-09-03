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
    label: "Restaurants",
    items: [{ href: "/admin/restaurants", label: "Restaurants", icon: UtensilsCrossed }],
  },
  {
    label: "Contenu",
    items: [
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
    <nav className="flex h-full w-60 flex-col gap-5 overflow-y-auto border-r border-gray-200 bg-white p-4">
      <span className="px-2 text-sm font-semibold text-brand-dark">19 Bonnes Tables — Admin</span>

      {NAV_GROUPS.map((group, groupIndex) => {
        const items = group.items.filter((item) => !item.superAdminOnly || role === "SUPER_ADMIN");
        if (items.length === 0) return null;

        return (
          <div key={group.label ?? `group-${groupIndex}`} className="flex flex-col gap-1">
            {group.label ? (
              <span className="mb-1 px-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
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
                    "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-brand-cream hover:text-brand-dark",
                    isActive && "bg-brand-cream text-brand-dark"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden />
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
