import Link from "next/link";

export function SiteFooter({
  siteName,
  contactEmail,
  footerText,
}: {
  siteName: string;
  contactEmail: string | null;
  footerText: string | null;
}) {
  return (
    <footer className="bg-brand-dark py-10 text-brand-cream">
      <div className="container flex flex-col items-center gap-3 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide">{siteName}</p>
        <Link href="/contact" className="text-sm text-brand-cream/80 hover:text-brand-cream">
          Contactez-nous
        </Link>
        {contactEmail ? (
          <a href={`mailto:${contactEmail}`} className="text-sm text-brand-cream/80 hover:text-brand-cream">
            {contactEmail}
          </a>
        ) : null}
        {footerText ? <p className="max-w-xl text-xs text-brand-cream/60">{footerText}</p> : null}
        <div className="mt-4 flex gap-4 text-xs text-brand-cream/60">
          <Link href="/mentions-legales" className="hover:text-brand-cream">
            Mentions légales
          </Link>
          <Link href="/politique-de-confidentialite" className="hover:text-brand-cream">
            Politique de confidentialité
          </Link>
        </div>
        <p className="text-xs text-brand-cream/40">
          © {new Date().getFullYear()} {siteName}
        </p>
      </div>
    </footer>
  );
}
