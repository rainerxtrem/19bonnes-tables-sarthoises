import Link from "next/link";
import { prisma } from "@/lib/db/prisma";

export const metadata = { title: "Dashboard | Administration" };

async function getCounts() {
  const [restaurants, pages, articles, partners, boardMembers, media, unreadMessages] =
    await Promise.all([
      prisma.restaurant.count(),
      prisma.page.count(),
      prisma.article.count(),
      prisma.partner.count(),
      prisma.boardMember.count(),
      prisma.media.count(),
      prisma.contactMessage.count({ where: { status: "UNREAD" } }),
    ]);
  return { restaurants, pages, articles, partners, boardMembers, media, unreadMessages };
}

const TILES: { key: keyof Awaited<ReturnType<typeof getCounts>>; label: string; href: string }[] = [
  { key: "restaurants", label: "Restaurants", href: "/admin/restaurants" },
  { key: "pages", label: "Pages", href: "/admin/pages" },
  { key: "articles", label: "Actualités", href: "/admin/actualites" },
  { key: "partners", label: "Partenaires", href: "/admin/partenaires" },
  { key: "boardMembers", label: "Membres du bureau", href: "/admin/bureau" },
  { key: "media", label: "Photos", href: "/admin/galerie" },
  { key: "unreadMessages", label: "Messages non lus", href: "/admin/messages" },
];

export default async function AdminDashboardPage() {
  const counts = await getCounts();

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-gray-900">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {TILES.map((tile) => (
          <Link
            key={tile.key}
            href={tile.href}
            className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <p className="text-3xl font-semibold text-brand-dark">{counts[tile.key]}</p>
            <p className="mt-1 text-sm text-gray-500">{tile.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
