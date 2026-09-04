import Link from "next/link";
import { Plus } from "lucide-react";
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
        <h1 className="font-display text-2xl text-ink-900">Galerie</h1>
        <Link
          href="/admin/galerie/new"
          className="inline-flex items-center gap-2 rounded-sm bg-wine-700 px-4 py-2 text-sm font-medium text-cream-50 transition-colors hover:bg-wine-800"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Nouvel album
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border border-ink-100 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-cream-50 text-left text-xs uppercase text-ink-500">
            <tr>
              <th className="px-3 py-2">Titre</th>
              <th className="px-3 py-2">Restaurant</th>
              <th className="px-3 py-2">Photos</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {albums.map((album) => (
              <tr key={album.id}>
                <td className="px-3 py-2 font-medium text-ink-900">{album.title}</td>
                <td className="px-3 py-2 text-ink-500">{album.restaurant?.name ?? "—"}</td>
                <td className="px-3 py-2 text-ink-500">{album._count.items}</td>
                <td className="px-3 py-2">
                  <Link href={`/admin/galerie/${album.id}`} className="text-brand hover:underline">
                    Gérer
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {albums.length === 0 ? <p className="p-8 text-center text-sm text-ink-500">Aucun album pour le moment.</p> : null}
      </div>
    </div>
  );
}
