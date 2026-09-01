import { prisma } from "@/lib/db/prisma";

export async function getPublicNavigationTree() {
  const items = await prisma.navigationItem.findMany({
    where: { isActive: true },
    include: { page: { select: { slug: true } } },
    orderBy: { order: "asc" },
  });

  const byParent = new Map<string | null, typeof items>();
  for (const item of items) {
    const key = item.parentId;
    byParent.set(key, [...(byParent.get(key) ?? []), item]);
  }

  function resolveHref(item: (typeof items)[number]): string {
    if (item.linkType === "EXTERNAL") return item.url ?? "#";
    if (item.page) return `/${item.page.slug}`;
    return item.url ?? "#";
  }

  function build(parentId: string | null): {
    id: string;
    label: string;
    href: string;
    openInNewTab: boolean;
    children: ReturnType<typeof build>;
  }[] {
    return (byParent.get(parentId) ?? []).map((item) => ({
      id: item.id,
      label: item.label,
      href: resolveHref(item),
      openInNewTab: item.openInNewTab,
      children: build(item.id),
    }));
  }

  return build(null);
}
