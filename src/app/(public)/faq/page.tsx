import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { Reveal } from "@/components/public/reveal";
import { FaqAccordion } from "@/components/public/faq-accordion";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = buildMetadata({
  title: "Foire aux questions",
  description:
    "Réponses aux questions les plus fréquentes sur les bons cadeaux, l'association des 19 Bonnes Tables Sarthoises et ses restaurants membres.",
  path: "/faq",
});

export default async function FaqPage() {
  const items = await prisma.faqItem.findMany({ where: { isActive: true }, orderBy: { order: "asc" } });

  const jsonLd =
    items.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: items.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
          })),
        }
      : null;

  return (
    <div>
      {jsonLd ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /> : null}

      <section className="border-b border-ink-900/10 bg-cream-100 py-20 sm:py-28">
        <div className="container text-center">
          <Reveal>
            <p className="eyebrow justify-center">Besoin d&apos;aide ?</p>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mx-auto mt-4 max-w-2xl font-display text-4xl text-ink-900 sm:text-5xl">
              Foire aux questions
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mx-auto mt-5 max-w-xl text-ink-600">
              Vous ne trouvez pas votre réponse ici ? Écrivez-nous depuis la page{" "}
              <Link href="/contact" className="link-sweep font-medium text-wine-700">
                Contact
              </Link>
              .
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container max-w-3xl">
          {items.length === 0 ? (
            <p className="text-center text-sm text-ink-500">Aucune question publiée pour le moment.</p>
          ) : (
            <Reveal>
              <FaqAccordion items={items} />
            </Reveal>
          )}
        </div>
      </section>
    </div>
  );
}
