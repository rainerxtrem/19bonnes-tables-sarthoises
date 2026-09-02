"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

export function ShareButton({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    // API native (mobile, certains navigateurs desktop) : ouvre le
    // sélecteur de partage du système. Repli : copie le lien.
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // Partage annulé par la personne — rien à faire.
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Presse-papiers indisponible (contexte non sécurisé, permission...).
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex items-center gap-1.5 rounded-sm border border-ink-900/15 px-3.5 py-2 text-xs font-medium uppercase tracking-wide text-ink-700 transition-colors hover:border-wine-700 hover:text-wine-700"
    >
      {copied ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Share2 className="h-3.5 w-3.5" aria-hidden />}
      {copied ? "Lien copié" : "Partager"}
    </button>
  );
}
