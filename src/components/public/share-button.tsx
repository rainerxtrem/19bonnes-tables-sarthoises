"use client";

import { useEffect, useRef, useState } from "react";
import { Share2, Facebook, Instagram, X as XIcon, MessageCircle, MessageSquare, Copy, Check, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function ShareButton({ title, url }: { title: string; url: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Ferme le menu au clic en dehors — pas de librairie de popover dans le
  // projet, ce pattern minimal suffit pour un seul menu à la fois.
  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Presse-papiers indisponible (contexte non sécurisé, permission...).
    }
  }

  function shareToInstagram() {
    // Contrairement à Facebook/X, Instagram n'a pas d'URL d'intention web
    // pour publier un lien. Sur mobile, on ouvre le partage natif du
    // système (qui liste Instagram parmi les applications disponibles) ;
    // sur desktop, on copie le lien pour que la personne le colle elle-même.
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title, url }).catch(() => {});
    } else {
      copyLink();
    }
    setOpen(false);
  }

  /** Facebook et X ouvrent leur propre app (accueil, pas l'écran de
   * publication) si le lien de partage est suivi comme une navigation
   * normale — leur app intercepte leur propre domaine dès qu'il détecte un
   * clic classique. Une fenêtre popup pilotée en JS (comme le recommandent
   * les deux plateformes pour leurs boutons de partage officiels) contourne
   * cette interception et ouvre bien l'écran "Publier" avec le lien
   * pré-rempli. */
  function openSharePopup(shareUrl: string) {
    window.open(shareUrl, "share-popup", "noopener,noreferrer,width=580,height=470");
    setOpen(false);
  }

  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(title);

  const links: { label: string; icon: LucideIcon; href?: string; onClick?: () => void }[] = [
    { label: "Instagram", icon: Instagram, onClick: shareToInstagram },
    {
      label: "Facebook",
      icon: Facebook,
      onClick: () => openSharePopup(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`),
    },
    {
      label: "X",
      icon: XIcon,
      onClick: () => openSharePopup(`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`),
    },
    { label: "WhatsApp", icon: MessageCircle, href: `https://wa.me/?text=${encodedText}%20${encodedUrl}` },
    { label: "Message", icon: MessageSquare, href: `sms:?&body=${encodedText}%20${encodedUrl}` },
  ];

  const itemClassName =
    "flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-ink-700 transition-colors hover:bg-cream-100 hover:text-wine-700";

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 rounded-sm border border-ink-900/15 px-3.5 py-2 text-xs font-medium uppercase tracking-wide text-ink-700 transition-colors hover:border-wine-700 hover:text-wine-700"
      >
        <Share2 className="h-3.5 w-3.5" aria-hidden />
        Partager
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-20 mt-2 w-52 overflow-hidden rounded-md border border-ink-900/10 bg-white py-1.5 shadow-elevated"
        >
          {links.map((link) =>
            link.href ? (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className={itemClassName}
                role="menuitem"
              >
                <link.icon className="h-4 w-4 shrink-0 text-gold-600" aria-hidden />
                {link.label}
              </a>
            ) : (
              <button key={link.label} type="button" onClick={link.onClick} className={itemClassName} role="menuitem">
                <link.icon className="h-4 w-4 shrink-0 text-gold-600" aria-hidden />
                {link.label}
              </button>
            )
          )}
          <div className="my-1.5 border-t border-ink-900/10" />
          <button type="button" onClick={copyLink} className={cn(itemClassName)} role="menuitem">
            {copied ? (
              <Check className="h-4 w-4 shrink-0 text-green-600" aria-hidden />
            ) : (
              <Copy className="h-4 w-4 shrink-0 text-gold-600" aria-hidden />
            )}
            {copied ? "Lien copié" : "Copier le lien"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
