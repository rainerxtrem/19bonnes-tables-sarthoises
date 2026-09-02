import type { Metadata } from "next";
import Link from "next/link";
import { Mail, CheckCircle2, XCircle } from "lucide-react";
import { unsubscribeByToken } from "@/lib/services/newsletter.service";
import { Reveal } from "@/components/public/reveal";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = buildMetadata({
  title: "Désinscription newsletter",
  description: "Se désinscrire de la newsletter des 19 Bonnes Tables Sarthoises.",
  path: "/newsletter/desinscription",
});

export default async function NewsletterUnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const subscriber = token ? await unsubscribeByToken(token) : null;

  return (
    <section className="border-b border-ink-900/10 bg-cream-100 py-20 sm:py-28">
      <div className="container text-center">
        <Reveal>
          <p className="eyebrow justify-center">Newsletter</p>
        </Reveal>
        <Reveal delay={80}>
          {subscriber ? (
            <>
              <CheckCircle2 className="mx-auto mt-4 h-10 w-10 text-wine-700" aria-hidden />
              <h1 className="mx-auto mt-4 max-w-xl font-display text-3xl text-ink-900 sm:text-4xl">
                Vous êtes désinscrit·e
              </h1>
              <p className="mx-auto mt-4 max-w-md text-ink-600">
                Votre adresse <span className="font-medium">{subscriber.email}</span> ne recevra plus la
                newsletter des 19 Bonnes Tables Sarthoises. Vous pourrez vous réinscrire à tout moment.
              </p>
            </>
          ) : (
            <>
              <XCircle className="mx-auto mt-4 h-10 w-10 text-ink-400" aria-hidden />
              <h1 className="mx-auto mt-4 max-w-xl font-display text-3xl text-ink-900 sm:text-4xl">
                Lien invalide
              </h1>
              <p className="mx-auto mt-4 max-w-md text-ink-600">
                Ce lien de désinscription n&apos;est plus valide. Si vous souhaitez ne plus recevoir la
                newsletter, contactez-nous directement.
              </p>
            </>
          )}
        </Reveal>
        <Reveal delay={160}>
          <Link href="/" className="link-sweep mt-6 inline-flex items-center gap-2 text-sm text-wine-700">
            <Mail className="h-4 w-4" aria-hidden />
            Retour à l&apos;accueil
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
