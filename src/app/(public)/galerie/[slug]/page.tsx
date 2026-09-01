import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
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
      <Link href="/galerie" className="link-sweep inline-flex items-center gap-1.5 text-xs uppercase tracking-wide text-ink-500">
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
        Toute la galerie
      </Link>
      <h1 className="mb-10 mt-4 text-center font-display text-4xl text-ink-900">{album.title}</h1>
      <LightboxGallery
        photos={album.items.map((item) => ({ id: item.id, url: item.media.url, alt: item.media.alt }))}
      />
    </div>
  );
}
