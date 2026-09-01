import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db/prisma";

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
    <div className="container py-16">
      <h1 className="mb-2 text-center text-3xl font-semibold text-brand-dark">Phototèque</h1>
      <p className="mx-auto mt-4 max-w-xl text-center text-sm text-gray-600">
        Photos des différents restaurants de l&apos;association.
      </p>

      {albums.length === 0 ? (
        <p className="mt-10 text-center text-sm text-gray-500">Aucun album pour le moment.</p>
      ) : (
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {albums.map((album) => (
            <Link
              key={album.id}
              href={`/galerie/${album.slug}`}
              className="group overflow-hidden rounded-lg bg-white shadow-sm hover:shadow-lg"
            >
              <div className="relative aspect-[4/3] bg-gray-100">
                {album.items[0] ? (
                  <Image
                    src={album.items[0].media.url}
                    alt={album.items[0].media.alt ?? album.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                ) : null}
              </div>
              <div className="p-4">
                <p className="font-medium text-brand-dark">{album.title}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
