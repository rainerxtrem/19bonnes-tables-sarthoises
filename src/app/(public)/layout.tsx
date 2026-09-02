import { getSiteSettings } from "@/lib/services/settings.service";
import { getPublicNavigationTree } from "@/lib/services/navigation.service";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";
import { CookieConsentBanner } from "@/components/public/cookie-consent-banner";

export const dynamic = "force-dynamic";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [settings, navItems] = await Promise.all([getSiteSettings(), getPublicNavigationTree()]);

  return (
    <div className="flex min-h-screen flex-col">
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
