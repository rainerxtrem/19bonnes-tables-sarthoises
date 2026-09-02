import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata = { title: "Page introuvable" };

export default function PublicNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-24 text-center">
      <p className="eyebrow justify-center">Erreur 404</p>
      <h1 className="mt-4 font-display text-4xl text-ink-900 sm:text-5xl">Cette page n&apos;existe pas</h1>
      <p className="mx-auto mt-4 max-w-md text-ink-600">
        La page que vous cherchez a peut-être changé d&apos;adresse ou n&apos;existe plus. Voici quelques pistes pour
        continuer votre visite.
      </p>
      <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
        <Link href="/" className="btn-cta">
          Retour à l&apos;accueil
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
        <Link href="/nos-restaurants" className="link-sweep text-sm font-medium text-wine-700">
          Découvrir nos restaurants
        </Link>
      </div>
    </div>
  );
}
