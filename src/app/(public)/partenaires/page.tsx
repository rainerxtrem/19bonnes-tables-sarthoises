import type { Metadata } from "next";
import Image from "next/image";
import { prisma } from "@/lib/db/prisma";
import { Reveal } from "@/components/public/reveal";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Partenaires" };

export default async function PartenairesPage() {
  const partners = await prisma.partner.findMany({
    where: { isActive: true },
    include: { logo: true },
    orderBy: { order: "asc" },
  });

  return (
    <div>
      <section className="border-b border-ink-900/10 bg-cream-100 py-20 sm:py-28">
        <div className="container text-center">
          <Reveal>
            <p className="eyebrow justify-center">Ils nous accompagnent</p>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mx-auto mt-4 max-w-2xl font-display text-4xl text-ink-900 sm:text-5xl">
              Partenaires locaux
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mx-auto mt-5 max-w-xl text-ink-600">
              Nos partenaires locaux sont au cœur de notre engagement pour une cuisine authentique et de qualité.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container">
          {partners.length === 0 ? (
            <p className="text-center text-sm text-ink-500">Aucun partenaire publié pour le moment.</p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {partners.map((partner, index) => {
                const content = (
                  <div className="flex h-full flex-col items-center rounded-md border border-ink-900/10 bg-cream-50 p-8 text-center shadow-card transition-shadow duration-300 hover:shadow-elevated">
                    {partner.logo ? (
                      <div className="relative mb-5 h-16 w-full grayscale transition-all duration-300 group-hover:grayscale-0">
                        <Image src={partner.logo.url} alt={partner.logo.alt ?? partner.name} fill className="object-contain" />
                      </div>
                    ) : null}
                    <p className="font-display text-lg text-ink-900">{partner.name}</p>
                    {partner.description ? (
                      <p className="mt-2 text-sm text-ink-600">{partner.description}</p>
                    ) : null}
                  </div>
                );

                return (
                  <Reveal key={partner.id} delay={(index % 3) * 100} className="group h-full">
                    {partner.websiteUrl ? (
                      <a href={partner.websiteUrl} target="_blank" rel="noopener noreferrer" className="block h-full">
                        {content}
                      </a>
                    ) : (
                      content
                    )}
                  </Reveal>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
