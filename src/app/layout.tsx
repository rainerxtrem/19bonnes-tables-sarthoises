import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { getSiteSettings } from "@/lib/services/settings.service";
import "./globals.css";

// Fraunces (titrage éditorial, chaleureux) + Inter (texte courant, très
// lisible) : direction typographique de la refonte "guide gastronomique" —
// voir globals.css pour les tokens de couleur associés.
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const FALLBACK_SITE_NAME = "19 Bonnes Tables Sarthoises";

export async function generateMetadata(): Promise<Metadata> {
  const base: Metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    title: { default: FALLBACK_SITE_NAME, template: `%s | ${FALLBACK_SITE_NAME}` },
    robots: { index: true, follow: true },
    twitter: { card: "summary_large_image" },
  };

  try {
    // Protégé par un try/catch : cette fonction est aussi appelée lors de la
    // génération statique de la page 404 racine au moment du build, quand
    // la base de données n'est pas forcément joignable (voir Dockerfile) —
    // sans repli, ça faisait échouer le build entier.
    const settings = await getSiteSettings();
    // Favicon dédié si défini dans /admin/settings, sinon on retombe sur le
    // logo déjà uploadé plutôt que de laisser l'icône par défaut du
    // navigateur — jamais d'image inventée.
    const iconUrl = settings.favicon?.url ?? settings.logo?.url;

    return {
      ...base,
      title: {
        default: settings.seoDefaultTitle || settings.siteName,
        template: `%s | ${settings.siteName}`,
      },
      description: settings.seoDefaultDescription || settings.siteDescription || undefined,
      icons: iconUrl ? { icon: iconUrl, apple: iconUrl } : undefined,
      openGraph: {
        siteName: settings.siteName,
        locale: "fr_FR",
        type: "website",
        images: settings.ogDefaultImage ? [{ url: settings.ogDefaultImage.url }] : undefined,
      },
    };
  } catch {
    return base;
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
