import type { Metadata } from "next";
import { ContactForm } from "@/components/public/contact-form";
import { Reveal } from "@/components/public/reveal";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = buildMetadata({
  title: "Contact",
  description:
    "Contactez l'association des 19 Bonnes Tables Sarthoises pour toute question ou demande de collaboration. Pour réserver, contactez directement le restaurant de votre choix.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <div>
      {/* Intro resserrée (pas de py-20/28 ni de lien email redondant avec le
          formulaire juste en dessous) : sur un écran standard, l'ancienne
          version remplissait toute la hauteur visible et le formulaire
          n'apparaissait qu'après un défilement complet. */}
      <section className="border-b border-ink-900/10 bg-cream-100 py-12 sm:py-16">
        <div className="container text-center">
          <Reveal>
            <p className="eyebrow justify-center">Restons en contact</p>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mx-auto mt-4 max-w-2xl font-display text-4xl text-ink-900 sm:text-5xl">
              Contactez-nous
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mx-auto mt-5 max-w-xl text-ink-600">
              Pour toute demande de renseignements concernant l&apos;association ou de collaborations,
              contactez-nous via le formulaire ci-dessous, nous vous répondrons dans les plus brefs délais. Ce site
              n&apos;est pas destiné aux réservations — contactez directement l&apos;établissement de votre choix.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container">
          <Reveal className="mx-auto max-w-xl">
            <ContactForm />
          </Reveal>
        </div>
      </section>
    </div>
  );
}
