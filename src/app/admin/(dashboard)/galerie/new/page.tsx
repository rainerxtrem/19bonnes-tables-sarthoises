import { prisma } from "@/lib/db/prisma";
import { GalleryAlbumForm } from "@/components/admin/gallery-album-form";

export const metadata = { title: "Nouvel album | Administration" };

export default async function NewGalleryAlbumPage() {
  const restaurants = await prisma.restaurant.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-gray-900">Nouvel album photo</h1>
      <GalleryAlbumForm restaurants={restaurants} />
    </div>
  );
}
