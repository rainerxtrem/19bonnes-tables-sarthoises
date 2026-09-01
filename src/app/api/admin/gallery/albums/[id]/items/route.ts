import { NextResponse, type NextRequest } from "next/server";
import { requireContentAccess } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api/handle-error";
import { addGalleryItemsSchema } from "@/lib/validation/gallery";
import { prisma } from "@/lib/db/prisma";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireContentAccess();
    const { id } = await params;
    const { mediaIds } = addGalleryItemsSchema.parse(await request.json());

    const maxOrder = await prisma.galleryItem.aggregate({
      where: { albumId: id },
      _max: { order: true },
    });
    let nextOrder = (maxOrder._max.order ?? -1) + 1;

    await prisma.galleryItem.createMany({
      data: mediaIds.map((mediaId) => ({ albumId: id, mediaId, order: nextOrder++ })),
      skipDuplicates: true,
    });

    const album = await prisma.galleryAlbum.findUnique({
      where: { id },
      include: { items: { include: { media: true }, orderBy: { order: "asc" } } },
    });

    return NextResponse.json({ album }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
