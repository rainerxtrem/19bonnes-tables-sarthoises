import Link from "next/link";
import { Rss } from "lucide-react";
import { NewsletterForm } from "@/components/public/newsletter-form";

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
    <footer className="bg-ink-950 text-cream-100">
      <div className="container grid grid-cols-1 gap-10 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-xl text-cream-50">{siteName}</p>
          <p className="mt-3 font-display italic text-gold-400">Le savoir-faire pour mieux vous servir.</p>
          {footerText ? <p className="mt-4 max-w-xs text-sm text-cream-100/60">{footerText}</p> : null}
        </div>

        <div>
          <p className="eyebrow text-cream-100/70">Découvrir</p>
          <nav className="mt-4 flex flex-col gap-2 text-sm text-cream-100/80">
            <Link href="/#restaurants" className="w-fit hover:text-gold-300">
              Nos restaurants
            </Link>
            <Link href="/le-bureau" className="w-fit hover:text-gold-300">
              L&apos;association
            </Link>
            <Link href="/actualites" className="w-fit hover:text-gold-300">
              Actualités
            </Link>
            <a href="/feed.xml" className="flex w-fit items-center gap-1.5 hover:text-gold-300">
              <Rss className="h-3.5 w-3.5" aria-hidden />
              Flux RSS
            </a>
            <Link href="/galerie" className="w-fit hover:text-gold-300">
              Galerie
            </Link>
            <Link href="/bon-cadeaux" className="w-fit hover:text-gold-300">
              Bons cadeaux
            </Link>
          </nav>
        </div>

        <div>
          <p className="eyebrow text-cream-100/70">Association</p>
          <nav className="mt-4 flex flex-col gap-2 text-sm text-cream-100/80">
            <Link href="/partenaires" className="w-fit hover:text-gold-300">
              Partenaires
            </Link>
            <Link href="/contact" className="w-fit hover:text-gold-300">
              Nous contacter
            </Link>
            <Link href="/mentions-legales" className="w-fit hover:text-gold-300">
              Mentions légales
            </Link>
            <Link href="/politique-de-confidentialite" className="w-fit hover:text-gold-300">
              Politique de confidentialité
            </Link>
            <Link href="/mon-restaurant" className="w-fit hover:text-gold-300">
              Espace restaurateur
            </Link>
          </nav>
        </div>

        <div>
          <p className="eyebrow text-cream-100/70">Contact</p>
          <div className="mt-4 flex flex-col gap-2 text-sm text-cream-100/80">
            {contactEmail ? (
              <a href={`mailto:${contactEmail}`} className="w-fit hover:text-gold-300">
                {contactEmail}
              </a>
            ) : null}
            <p className="max-w-xs text-cream-100/50">
              Association d&apos;hommes et de femmes de métiers, réunis autour d&apos;une même exigence.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-cream-50/10">
        <div className="container flex flex-col items-start justify-between gap-6 py-12 lg:flex-row lg:items-center">
          <div>
            <p className="eyebrow text-cream-100/70">Restez informés</p>
            <p className="mt-2 max-w-xs text-sm text-cream-100/60">
              Recevez nos actualités : recettes de terroir, événements et vie de l&apos;association.
            </p>
          </div>
          <NewsletterForm />
        </div>
      </div>

      <div className="border-t border-cream-50/10">
        <div className="container flex flex-col items-center justify-between gap-3 py-6 text-xs text-cream-100/40 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {siteName} — Association loi 1901.
          </p>
          <p>Site conçu pour faire rayonner nos métiers.</p>
        </div>
      </div>
    </footer>
  );
}
