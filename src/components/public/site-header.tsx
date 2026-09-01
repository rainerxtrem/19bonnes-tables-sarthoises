"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

interface NavItem {
  id: string;
  label: string;
  href: string;
  openInNewTab: boolean;
  children: NavItem[];
}

export function SiteHeader({
  siteName,
  items,
  logoUrl,
}: {
  siteName: string;
  items: NavItem[];
  logoUrl?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 12);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Le lien "Contact" est géré par le CMS comme les autres (voir
  // /admin/navigation) : on l'isole juste pour le mettre en avant visuellement
  // au lieu de dupliquer un second lien codé en dur vers /contact.
  const contactItem = items.find((item) => item.href === "/contact");
  const mainItems = items.filter((item) => item !== contactItem);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-ink-900/10 bg-cream-50/95 backdrop-blur transition-shadow duration-300",
        scrolled && "shadow-[0_1px_0_0_rgba(23,19,15,0.06)]"
      )}
    >
      <div className="container flex h-20 items-center justify-between">
        <Link href="/" className="group flex items-center gap-3">
          {logoUrl ? (
            // object-contain (pas de recadrage) : on ne connaît pas les
            // proportions du logo uploadé, qu'il soit carré, rond ou large.
            <span className="relative h-11 w-11 shrink-0 sm:h-12 sm:w-12">
              <Image src={logoUrl} alt={siteName} fill className="object-contain" sizes="48px" />
            </span>
          ) : null}
          <span className="flex flex-col leading-none">
            <span className="font-display text-lg font-medium tracking-wide text-ink-900 sm:text-xl">
              {siteName}
            </span>
            <span className="mt-1 hidden text-[10px] uppercase tracking-[0.25em] text-gold-600 sm:block">
              Le savoir-faire pour mieux vous servir
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex">
          {mainItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              target={item.openInNewTab ? "_blank" : undefined}
              rel={item.openInNewTab ? "noopener noreferrer" : undefined}
              className="link-sweep whitespace-nowrap rounded-sm px-3 py-2 text-sm font-medium text-ink-700 transition-colors hover:text-wine-700"
            >
              {item.label}
            </Link>
          ))}
          {contactItem ? (
            <Link
              href={contactItem.href}
              target={contactItem.openInNewTab ? "_blank" : undefined}
              rel={contactItem.openInNewTab ? "noopener noreferrer" : undefined}
              className="ml-2 whitespace-nowrap rounded-sm border border-ink-900/15 px-4 py-2 text-sm font-medium text-ink-900 transition-colors hover:border-wine-700 hover:text-wine-700"
            >
              {contactItem.label}
            </Link>
          ) : null}
        </nav>

        <button
          className="relative z-50 flex h-10 w-10 items-center justify-center text-ink-900 lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
        >
          <span className="relative block h-4 w-6">
            <span
              className={cn(
                "absolute left-0 top-0 block h-0.5 w-6 bg-current transition-transform duration-300",
                open && "translate-y-[7px] rotate-45"
              )}
            />
            <span
              className={cn(
                "absolute left-0 top-[7px] block h-0.5 w-6 bg-current transition-opacity duration-200",
                open && "opacity-0"
              )}
            />
            <span
              className={cn(
                "absolute left-0 top-[14px] block h-0.5 w-6 bg-current transition-transform duration-300",
                open && "-translate-y-[7px] -rotate-45"
              )}
            />
          </span>
        </button>
      </div>

      {/* Menu mobile/tablette plein écran (sous le seuil lg où la nav compacte s'affiche) */}
      <div
        className={cn(
          "fixed inset-0 top-20 z-40 bg-cream-50 transition-opacity duration-300 lg:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
      >
        <nav className="container flex flex-col divide-y divide-ink-900/10 pt-4">
          {mainItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              target={item.openInNewTab ? "_blank" : undefined}
              rel={item.openInNewTab ? "noopener noreferrer" : undefined}
              className="py-4 font-display text-2xl text-ink-900"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          {contactItem ? (
            <Link
              href={contactItem.href}
              className="py-4 font-display text-2xl text-wine-700"
              onClick={() => setOpen(false)}
            >
              {contactItem.label}
            </Link>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
