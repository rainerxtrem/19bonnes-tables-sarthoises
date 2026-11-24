import { getSiteSettings } from "@/lib/services/settings.service";
import { getPublicNavigationTree } from "@/lib/services/navigation.service";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";
import { CookieConsentBanner } from "@/components/public/cookie-consent-banner";
import { AnalyticsLoader } from "@/components/public/analytics-loader";
import { SeasonalBanner } from "@/components/public/seasonal-banner";
import { SeasonalEffects } from "@/components/public/seasonal-effects";
import { SeasonalFooterDecor } from "@/components/public/seasonal-footer-decor";
import { absoluteUrl } from "@/lib/seo";
import { resolveActiveTheme, themeAttribute } from "@/lib/themes";

export const dynamic = "force-dynamic";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [settings, navItems] = await Promise.all([getSiteSettings(), getPublicNavigationTree()]);

  // Organization JSON-LD, présent sur tout le site public : identifie
  // l'association auprès des moteurs de recherche (nom, logo, contact,
  // réseaux sociaux) indépendamment du contenu de chaque page.
  const sameAs = [settings.facebookUrl, settings.instagramUrl, settings.linkedinUrl].filter(
    (url): url is string => Boolean(url)
  );
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.siteName,
    url: absoluteUrl("/"),
    logo: settings.logo?.url,
    email: settings.contactEmail ?? undefined,
    telephone: settings.contactPhone ?? undefined,
    address: settings.address ? { "@type": "PostalAddress", streetAddress: settings.address } : undefined,
    sameAs: sameAs.length > 0 ? sameAs : undefined,
  };

  // Thème saisonnier : posé uniquement ici (jamais sur /admin), il redéfinit
  // les variables de couleur — voir src/lib/themes/palettes.ts. Le fond est
  // répété sur ce wrapper car <body> reste hors de sa portée.
  const activeTheme = resolveActiveTheme(settings);
  const isSeasonal = activeTheme !== "NORMAL";

  return (
    <div
      data-theme={isSeasonal ? themeAttribute(activeTheme) : undefined}
      className="flex min-h-screen flex-col bg-cream-100 text-ink-800"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      {isSeasonal && settings.themeBannerText ? (
        <SeasonalBanner theme={activeTheme} text={settings.themeBannerText} />
      ) : null}
      <SiteHeader
        siteName={settings.siteName}
        items={navItems}
        logoUrl={settings.logo?.url ?? null}
        theme={activeTheme}
      />
      <main className="flex-1">{children}</main>
      <SeasonalFooterDecor theme={activeTheme} />
      <SiteFooter
        siteName={settings.siteName}
        contactEmail={settings.contactEmail}
        footerText={settings.footerText}
      />
      {isSeasonal && settings.themeEffects ? <SeasonalEffects theme={activeTheme} /> : null}
      <CookieConsentBanner />
      <AnalyticsLoader />
    </div>
  );
}
