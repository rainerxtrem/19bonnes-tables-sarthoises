// Utilitaire partagé pour le consentement cookies (voir CookieConsentBanner).
// Centralisé ici pour qu'un futur script de mesure d'audience (Google
// Analytics, Matomo...) puisse vérifier le consentement avant de se charger,
// sans dépendre du composant du bandeau lui-même.
const STORAGE_KEY = "cookie-consent";

export type CookieConsentValue = "accepted" | "rejected";

interface StoredConsent {
  value: CookieConsentValue;
  date: string;
}

export function getStoredConsent(): StoredConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredConsent;
  } catch {
    return null;
  }
}

export function setStoredConsent(value: CookieConsentValue): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ value, date: new Date().toISOString() }));
  } catch {
    // localStorage indisponible (navigation privée stricte, etc.) — on
    // n'insiste pas, le bandeau réapparaîtra simplement à la prochaine visite.
  }
}

/** À utiliser avant de charger un futur script de mesure d'audience. */
export function hasAnalyticsConsent(): boolean {
  return getStoredConsent()?.value === "accepted";
}
