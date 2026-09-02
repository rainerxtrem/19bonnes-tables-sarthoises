import { prisma } from "@/lib/db/prisma";
import { ensureUniqueSlug, slugifyText } from "@/lib/slug";
import type { RestaurantInput } from "@/lib/validation/restaurant";
import type { Prisma } from "@prisma/client";

const restaurantWithRelations = {
  include: {
    mainImage: true,
    ogImage: true,
    images: { include: { media: true }, orderBy: { order: "asc" as const } },
    boardMembers: true,
    galleryAlbum: true,
  },
} satisfies Prisma.RestaurantDefaultArgs;

export type RestaurantWithRelations = Prisma.RestaurantGetPayload<typeof restaurantWithRelations>;

/**
 * Garde la galerie publique (/galerie/[slug]) synchronisée avec les photos
 * choisies dans "Galerie du restaurant" sur la fiche (admin ou
 * /mon-restaurant) : une seule liste de photos à gérer, au même endroit,
 * plutôt que deux galeries indépendantes qui finissaient par diverger.
 */
async function syncGalleryAlbum(
  tx: Prisma.TransactionClient,
  restaurantId: string,
  restaurantSlug: string,
  restaurantName: string,
  mediaIds: string[]
) {
  const album = await tx.galleryAlbum.upsert({
    where: { restaurantId },
    update: {},
    create: { slug: restaurantSlug, title: restaurantName, restaurantId },
  });

  await tx.galleryItem.deleteMany({ where: { albumId: album.id } });
  if (mediaIds.length) {
    await tx.galleryItem.createMany({
      data: mediaIds.map((mediaId, order) => ({ albumId: album.id, mediaId, order })),
    });
  }
}

export async function listRestaurantsAdmin() {
  return prisma.restaurant.findMany({
    include: { mainImage: true },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });
}

export async function listPublishedRestaurants() {
  return prisma.restaurant.findMany({
    where: { status: "PUBLISHED" },
    include: { mainImage: true },
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });
}

export async function getRestaurantById(id: string) {
  return prisma.restaurant.findUnique({ where: { id }, ...restaurantWithRelations });
}

export async function getRestaurantBySlug(slug: string) {
  return prisma.restaurant.findUnique({ where: { slug }, ...restaurantWithRelations });
}

export async function getPublishedRestaurantBySlug(slug: string) {
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug },
    ...restaurantWithRelations,
  });
  if (!restaurant || restaurant.status !== "PUBLISHED") return null;
  return restaurant;
}

export async function createRestaurant(input: RestaurantInput) {
  const slug = await ensureUniqueSlug("restaurant", input.slug || input.name);
  const { galleryMediaIds, ...data } = input;

  return prisma.$transaction(async (tx) => {
    const restaurant = await tx.restaurant.create({
      data: {
        ...data,
        slug,
        shortDescription: emptyToNull(data.shortDescription),
        description: emptyToNull(data.description),
        address: emptyToNull(data.address),
        postalCode: emptyToNull(data.postalCode),
        city: emptyToNull(data.city),
        phone: emptyToNull(data.phone),
        email: emptyToNull(data.email),
        website: emptyToNull(data.website),
        googleMapsUrl: emptyToNull(data.googleMapsUrl),
        facebookUrl: emptyToNull(data.facebookUrl),
        instagramUrl: emptyToNull(data.instagramUrl),
        priceLunch: emptyToNull(data.priceLunch),
        priceDinner: emptyToNull(data.priceDinner),
        additionalInfo: emptyToNull(data.additionalInfo),
        openingHours: data.openingHours ? (data.openingHours as unknown as Prisma.InputJsonValue) : undefined,
        publishedAt: data.status === "PUBLISHED" ? new Date() : null,
        images: galleryMediaIds?.length
          ? {
              create: galleryMediaIds.map((mediaId, order) => ({ mediaId, order })),
            }
          : undefined,
      },
    });

    await syncGalleryAlbum(tx, restaurant.id, slug, restaurant.name, galleryMediaIds ?? []);

    return tx.restaurant.findUniqueOrThrow({ where: { id: restaurant.id }, ...restaurantWithRelations });
  });
}

export async function updateRestaurant(id: string, input: RestaurantInput) {
  const existing = await prisma.restaurant.findUniqueOrThrow({ where: { id } });
  const slug =
    input.slug && slugifyText(input.slug) !== existing.slug
      ? await ensureUniqueSlug("restaurant", input.slug, id)
      : existing.slug;

  const { galleryMediaIds, ...data } = input;

  return prisma.$transaction(async (tx) => {
    if (galleryMediaIds) {
      await tx.restaurantImage.deleteMany({ where: { restaurantId: id } });
      if (galleryMediaIds.length) {
        await tx.restaurantImage.createMany({
          data: galleryMediaIds.map((mediaId, order) => ({ restaurantId: id, mediaId, order })),
        });
      }
      await syncGalleryAlbum(tx, id, slug, data.name ?? existing.name, galleryMediaIds);
    }

    return tx.restaurant.update({
      where: { id },
      data: {
        ...data,
        slug,
        shortDescription: emptyToNull(data.shortDescription),
        description: emptyToNull(data.description),
        address: emptyToNull(data.address),
        postalCode: emptyToNull(data.postalCode),
        city: emptyToNull(data.city),
        phone: emptyToNull(data.phone),
        email: emptyToNull(data.email),
        website: emptyToNull(data.website),
        googleMapsUrl: emptyToNull(data.googleMapsUrl),
        facebookUrl: emptyToNull(data.facebookUrl),
        instagramUrl: emptyToNull(data.instagramUrl),
        priceLunch: emptyToNull(data.priceLunch),
        priceDinner: emptyToNull(data.priceDinner),
        additionalInfo: emptyToNull(data.additionalInfo),
        openingHours: data.openingHours ? (data.openingHours as unknown as Prisma.InputJsonValue) : undefined,
        publishedAt:
          data.status === "PUBLISHED" && existing.status !== "PUBLISHED"
            ? new Date()
            : data.status === "PUBLISHED"
              ? existing.publishedAt
              : null,
      },
      ...restaurantWithRelations,
    });
  });
}

export async function deleteRestaurant(id: string) {
  return prisma.restaurant.delete({ where: { id } });
}

export async function setRestaurantStatus(id: string, status: "PUBLISHED" | "ARCHIVED") {
  const existing = await prisma.restaurant.findUniqueOrThrow({ where: { id } });
  return prisma.restaurant.update({
    where: { id },
    data: {
      status,
      publishedAt: status === "PUBLISHED" && !existing.publishedAt ? new Date() : existing.publishedAt,
    },
  });
}

export async function duplicateRestaurant(id: string) {
  const original = await prisma.restaurant.findUniqueOrThrow({
    where: { id },
    include: { images: true },
  });

  const slug = await ensureUniqueSlug("restaurant", `${original.name}-copie`);
  const maxOrder = await prisma.restaurant.aggregate({ _max: { order: true } });
  const mediaIds = original.images.map((image) => image.mediaId);

  return prisma.$transaction(async (tx) => {
    const restaurant = await tx.restaurant.create({
      data: {
        name: `${original.name} (copie)`,
        slug,
        shortDescription: original.shortDescription,
        description: original.description,
        address: original.address,
        postalCode: original.postalCode,
        city: original.city,
        latitude: original.latitude,
        longitude: original.longitude,
        phone: original.phone,
        email: original.email,
        website: original.website,
        googleMapsUrl: original.googleMapsUrl,
        facebookUrl: original.facebookUrl,
        instagramUrl: original.instagramUrl,
        openingHours:
          original.openingHours === null ? undefined : (original.openingHours as unknown as Prisma.InputJsonValue),
        priceLunch: original.priceLunch,
        priceDinner: original.priceDinner,
        additionalInfo: original.additionalInfo,
        mainImageId: original.mainImageId,
        ogImageId: original.ogImageId,
        isFeatured: original.isFeatured,
        seoTitle: original.seoTitle,
        seoDescription: original.seoDescription,
        status: "DRAFT",
        publishedAt: null,
        order: (maxOrder._max.order ?? 0) + 1,
        images: {
          create: original.images.map((image) => ({ mediaId: image.mediaId, order: image.order })),
        },
      },
    });

    await syncGalleryAlbum(tx, restaurant.id, slug, restaurant.name, mediaIds);

    return tx.restaurant.findUniqueOrThrow({ where: { id: restaurant.id }, ...restaurantWithRelations });
  });
}

export async function reorderRestaurants(items: { id: string; order: number }[]) {
  await prisma.$transaction(
    items.map((item) =>
      prisma.restaurant.update({ where: { id: item.id }, data: { order: item.order } })
    )
  );
}

function emptyToNull(value?: string | null) {
  return value === "" || value === undefined ? null : value;
}
