import { prisma } from "@/lib/db/prisma";
import { NavigationManager } from "@/components/admin/navigation-manager";

export const metadata = { title: "Navigation | Administration" };

export default async function AdminNavigationPage() {
  const [items, pages] = await Promise.all([
    prisma.navigationItem.findMany({
      include: { page: { select: { title: true, slug: true } }, parent: { select: { label: true } } },
      orderBy: { order: "asc" },
    }),
    prisma.page.findMany({ select: { id: true, title: true, slug: true }, orderBy: { title: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl text-ink-900">Navigation</h1>
      <NavigationManager initialItems={items} pages={pages} />
    </div>
  );
}
