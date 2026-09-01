import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db/prisma";
import { Reveal } from "@/components/public/reveal";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Galerie" };

export default async function GalerieIndexPage() {
  const albums = await prisma.galleryAlbum.findMany({
    include: {
      restaurant: { select: { name: true } },
      items: { include: { media: true }, orderBy: { order: "asc" }, take: 1 },
    },
    orderBy: { order: "asc" },
  });

  return (
    <div>
      <section className="border-b border-ink-900/10 bg-cream-100 py-20 sm:py-28">
        <div className="container text-center">
          <Reveal>
            <p className="eyebrow justify-center">En images</p>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mx-auto mt-4 max-w-2xl font-display text-4xl text-ink-900 sm:text-5xl">Phototèque</h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mx-auto mt-5 max-w-xl text-ink-600">
              Photos des différents restaurants de l&apos;association.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container">
          {albums.length === 0 ? (
            <p className="text-center text-sm text-ink-500">Aucun album pour le moment.</p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {albums.map((album, index) => (
                <Reveal key={album.id} delay={(index % 3) * 100}>
                  <Link
                    href={`/galerie/${album.slug}`}
                    className="group block overflow-hidden rounded-md bg-cream-50 shadow-card transition-all duration-500 ease-editorial hover:-translate-y-1 hover:shadow-elevated"
                  >
                    <div className="relative aspect-[4/3] bg-ink-100">
                      {album.items[0] ? (
                        <Image
                          src={album.items[0].media.url}
                          alt={album.items[0].media.alt ?? album.title}
                          fill
                          className="object-cover transition-transform duration-700 ease-editorial group-hover:scale-[1.06]"
                        />
                      ) : null}
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/60 to-transparent" />
                    </div>
                    <div className="p-5">
                      <p className="font-display text-lg text-ink-900">{album.title}</p>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
