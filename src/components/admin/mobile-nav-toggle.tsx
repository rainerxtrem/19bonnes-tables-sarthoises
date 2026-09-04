"use client";

import { Menu } from "lucide-react";
import { useMobileNav } from "@/components/admin/mobile-nav-context";

export function MobileNavToggle() {
  const { open, setOpen } = useMobileNav();
  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
      aria-expanded={open}
      className="-ml-2 flex h-9 w-9 items-center justify-center rounded-sm text-ink-600 hover:bg-cream-100 lg:hidden"
    >
      <Menu className="h-5 w-5" aria-hidden />
    </button>
  );
}
