import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { GalleryAlbumForm } from "@/components/admin/gallery-album-form";
import { GalleryItemsManager } from "@/components/admin/gallery-items-manager";

export const metadata = { title: "Gérer un album | Administration" };

export default async function EditGalleryAlbumPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [album, restaurants] = await Promise.all([
    prisma.galleryAlbum.findUnique({
      where: { id },
      include: { items: { include: { media: true }, orderBy: { order: "asc" } } },
    }),
    prisma.restaurant.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  if (!album) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">{album.title}</h1>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <GalleryItemsManager albumId={album.id} initialItems={album.items} />
        </div>
        <GalleryAlbumForm album={album} restaurants={restaurants} />
      </div>
    </div>
  );
}
