"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

interface NavItem {
  id: string;
  label: string;
  href: string;
  openInNewTab: boolean;
  children: NavItem[];
}

export function SiteHeader({ siteName, items }: { siteName: string; items: NavItem[] }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-brand-cream/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="text-sm font-semibold uppercase tracking-wide text-brand-dark">
          {siteName}
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              target={item.openInNewTab ? "_blank" : undefined}
              rel={item.openInNewTab ? "noopener noreferrer" : undefined}
              className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:text-brand-dark"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          className="rounded p-2 text-gray-700 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Ouvrir le menu"
          aria-expanded={open}
        >
          <span className="block h-0.5 w-6 bg-current" />
          <span className="mt-1.5 block h-0.5 w-6 bg-current" />
          <span className="mt-1.5 block h-0.5 w-6 bg-current" />
        </button>
      </div>

      <div className={cn("border-t border-black/5 bg-brand-cream md:hidden", open ? "block" : "hidden")}>
        <nav className="container flex flex-col py-2">
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              target={item.openInNewTab ? "_blank" : undefined}
              rel={item.openInNewTab ? "noopener noreferrer" : undefined}
              className="rounded-md px-3 py-3 text-sm font-medium text-gray-700 hover:text-brand-dark"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
