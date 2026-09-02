"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getStoredConsent, setStoredConsent, type CookieConsentValue } from "@/lib/cookie-consent";

export function CookieConsentBanner() {
  // false par défaut (y compris lors du premier rendu serveur) pour éviter
  // tout écart d'hydratation : on ne décide d'afficher le bandeau qu'une
  // fois côté client, après avoir consulté le localStorage.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(getStoredConsent() === null);
  }, []);

  function choose(value: CookieConsentValue) {
    setStoredConsent(value);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Gestion des cookies"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-ink-900/10 bg-cream-50/98 p-4 shadow-elevated backdrop-blur sm:p-5"
    >
      <div className="container flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <p className="text-sm text-ink-700">
          Ce site utilise uniquement des cookies techniques strictement nécessaires à son fonctionnement (connexion
          à l&apos;espace d&apos;administration). Aucun cookie de mesure d&apos;audience ou publicitaire n&apos;est
          déposé sans votre accord.{" "}
          <Link href="/politique-de-confidentialite" className="link-sweep text-wine-700">
            En savoir plus
          </Link>
        </p>
        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={() => choose("rejected")}
            className="whitespace-nowrap rounded-sm border border-ink-900/15 px-4 py-2 text-sm font-medium text-ink-800 transition-colors hover:border-wine-700 hover:text-wine-700"
          >
            Refuser
          </button>
          <button type="button" onClick={() => choose("accepted")} className="btn-cta whitespace-nowrap">
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}
