"use client";

import { useEffect } from "react";
import { getStoredConsent } from "@/lib/cookie-consent";
import { loadAnalytics } from "@/lib/analytics";

/** Charge la mesure d'audience au montage si le visiteur a déjà donné son
 * accord lors d'une visite précédente (le bandeau gère, lui, le cas d'un
 * consentement donné pendant la session en cours). */
export function AnalyticsLoader() {
  useEffect(() => {
    if (getStoredConsent()?.value === "accepted") {
      loadAnalytics();
    }
  }, []);

  return null;
}
