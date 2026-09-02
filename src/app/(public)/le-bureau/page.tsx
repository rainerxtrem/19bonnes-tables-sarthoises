import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { Reveal } from "@/components/public/reveal";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = buildMetadata({
  title: "Le bureau de l'association",
  description:
    "Découvrez le bureau de l'association des 19 Bonnes Tables Sarthoises : président, trésorier, secrétaire et les restaurateurs sarthois qui portent ces fonctions bénévolement.",
  path: "/le-bureau",
});

export default async function BureauPage() {
  const members = await prisma.boardMember.findMany({
    where: { isActive: true },
    include: { photo: true, restaurant: { select: { name: true, slug: true } } },
    orderBy: { order: "asc" },
  });

  return (
    <div>
      <section className="border-b border-ink-900/10 bg-cream-100 py-20 sm:py-28">
        <div className="container text-center">
          <Reveal>
            <p className="eyebrow justify-center">L&apos;association</p>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mx-auto mt-4 max-w-2xl font-display text-4xl text-ink-900 sm:text-5xl">
              Le bureau de l&apos;association
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mx-auto mt-5 max-w-xl text-ink-600">
              Le bureau met à profit sa vaste expérience pour aider l&apos;association à répondre à ses divers
              besoins. Notre passion commune du métier nous unit avec les autres membres.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container">
          {members.length === 0 ? (
            <p className="text-center text-sm text-ink-500">Aucun membre publié pour le moment.</p>
          ) : (
            <div className="grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 lg:grid-cols-4">
              {members.map((member, index) => (
                <Reveal key={member.id} delay={(index % 4) * 80} className="text-center">
                  <div className="relative mx-auto aspect-square w-32 overflow-hidden rounded-full bg-ink-100 shadow-card sm:w-36">
                    {member.photo ? (
                      <Image
                        src={member.photo.url}
                        alt={member.photo.alt ?? `${member.firstName} ${member.lastName}`}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center font-display text-3xl text-ink-300">
                        {member.firstName.charAt(0)}
                        {member.lastName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <p className="mt-4 font-display text-lg text-ink-900">
                    {member.firstName} {member.lastName}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-gold-600">{member.role}</p>
                  {member.restaurant ? (
                    <Link
                      href={`/${member.restaurant.slug}`}
                      className="link-sweep mt-1 inline-block text-sm text-wine-700"
                    >
                      {member.restaurant.name}
                    </Link>
                  ) : null}
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
