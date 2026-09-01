import { prisma } from "@/lib/db/prisma";

export async function getSiteSettings() {
  const settings = await prisma.siteSetting.findUnique({
    where: { id: "singleton" },
    include: { logo: true, favicon: true, ogDefaultImage: true },
  });

  if (settings) return settings;

  return prisma.siteSetting.create({
    data: { id: "singleton" },
    include: { logo: true, favicon: true, ogDefaultImage: true },
  });
}
