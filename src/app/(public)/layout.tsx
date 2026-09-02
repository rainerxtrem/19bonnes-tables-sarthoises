import { getSiteSettings } from "@/lib/services/settings.service";
import { getPublicNavigationTree } from "@/lib/services/navigation.service";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";
import { CookieConsentBanner } from "@/components/public/cookie-consent-banner";
import { absoluteUrl } from "@/lib/seo";

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

  return (
    <div className="flex min-h-screen flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <SiteHeader siteName={settings.siteName} items={navItems} logoUrl={settings.logo?.url ?? null} />
      <main className="flex-1">{children}</main>
      <SiteFooter
        siteName={settings.siteName}
        contactEmail={settings.contactEmail}
        footerText={settings.footerText}
      />
      <CookieConsentBanner />
    </div>
  );
}
