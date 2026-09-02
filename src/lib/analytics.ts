// Mesure d'audience auto-hébergée (Umami) : aucune donnée envoyée à un
// tiers, aucun cookie de tracage (Umami ne dépose pas de cookie du tout).
// Chargé uniquement après consentement explicite (voir cookie-consent.ts et
// CookieConsentBanner), même si techniquement Umami n'aurait pas besoin
// d'un consentement RGPD au sens strict — par cohérence avec ce qui est
// annoncé dans le bandeau.
const SCRIPT_URL = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL;
const WEBSITE_ID = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;

const SCRIPT_ID = "umami-analytics-script";

export function analyticsConfigured(): boolean {
  return Boolean(SCRIPT_URL && WEBSITE_ID);
}

export function loadAnalytics(): void {
  if (typeof document === "undefined") return;
  if (!analyticsConfigured()) return;
  if (document.getElementById(SCRIPT_ID)) return;

  const script = document.createElement("script");
  script.id = SCRIPT_ID;
  script.src = SCRIPT_URL!;
  script.defer = true;
  script.setAttribute("data-website-id", WEBSITE_ID!);
  document.head.appendChild(script);
}
