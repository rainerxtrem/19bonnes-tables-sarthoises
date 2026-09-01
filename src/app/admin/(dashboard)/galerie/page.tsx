import Link from "next/link";
import { prisma } from "@/lib/db/prisma";

export const metadata = { title: "Galerie | Administration" };

export default async function AdminGalleryPage() {
  const albums = await prisma.galleryAlbum.findMany({
    include: { restaurant: { select: { name: true } }, _count: { select: { items: true } } },
    orderBy: { order: "asc" },
  });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Galerie</h1>
        <Link href="/admin/galerie/new" className="inline-flex items-center justify-center rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark">
          Nouvel album
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-3 py-2">Titre</th>
              <th className="px-3 py-2">Restaurant</th>
              <th className="px-3 py-2">Photos</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {albums.map((album) => (
              <tr key={album.id}>
                <td className="px-3 py-2 font-medium text-gray-900">{album.title}</td>
                <td className="px-3 py-2 text-gray-500">{album.restaurant?.name ?? "—"}</td>
                <td className="px-3 py-2 text-gray-500">{album._count.items}</td>
                <td className="px-3 py-2">
                  <Link href={`/admin/galerie/${album.id}`} className="text-brand hover:underline">
                    Gérer
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {albums.length === 0 ? <p className="p-8 text-center text-sm text-gray-500">Aucun album pour le moment.</p> : null}
      </div>
    </div>
  );
}
