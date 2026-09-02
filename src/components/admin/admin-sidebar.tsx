"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import type { Role } from "@prisma/client";

const NAV_ITEMS: { href: string; label: string; superAdminOnly?: boolean }[] = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/restaurants", label: "Restaurants" },
  { href: "/admin/pages", label: "Pages" },
  { href: "/admin/actualites", label: "Actualités" },
  { href: "/admin/bureau", label: "Bureau" },
  { href: "/admin/galerie", label: "Galerie" },
  { href: "/admin/partenaires", label: "Partenaires" },
  { href: "/admin/bon-cadeaux", label: "Bons cadeaux" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/newsletter", label: "Newsletter" },
  { href: "/admin/navigation", label: "Navigation" },
  { href: "/admin/redirections", label: "Redirections", superAdminOnly: true },
  { href: "/admin/settings", label: "Paramètres", superAdminOnly: true },
  { href: "/admin/administrateurs", label: "Administrateurs", superAdminOnly: true },
];

export function AdminSidebar({ role }: { role: Role }) {
  const pathname = usePathname();

  return (
    <nav className="flex h-full w-60 flex-col gap-1 border-r border-gray-200 bg-white p-4">
      <span className="mb-4 px-2 text-sm font-semibold text-brand-dark">
        19 Bonnes Tables — Admin
      </span>
      {NAV_ITEMS.filter((item) => !item.superAdminOnly || role === "SUPER_ADMIN").map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-brand-cream hover:text-brand-dark",
              isActive && "bg-brand-cream text-brand-dark"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
