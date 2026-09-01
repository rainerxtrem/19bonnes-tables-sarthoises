import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { LightboxGallery } from "@/components/public/lightbox-gallery";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const album = await prisma.galleryAlbum.findUnique({ where: { slug } });
  return { title: album ? album.title : "Galerie" };
}

export default async function GalerieAlbumPage({ params }: Props) {
  const { slug } = await params;
  const album = await prisma.galleryAlbum.findUnique({
    where: { slug },
    include: { items: { include: { media: true }, orderBy: { order: "asc" } } },
  });

  if (!album) notFound();

  return (
    <div className="container py-16">
      <h1 className="mb-10 text-center text-3xl font-semibold text-brand-dark">{album.title}</h1>
      <LightboxGallery
        photos={album.items.map((item) => ({ id: item.id, url: item.media.url, alt: item.media.alt }))}
      />
    </div>
  );
}
