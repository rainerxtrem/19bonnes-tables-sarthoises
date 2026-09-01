import { NextResponse, type NextRequest } from "next/server";
import { requireContentAccess } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api/handle-error";
import { galleryAlbumSchema } from "@/lib/validation/gallery";
import { ensureUniqueSlug } from "@/lib/slug";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    await requireContentAccess();
    const albums = await prisma.galleryAlbum.findMany({
      include: { restaurant: { select: { name: true } }, _count: { select: { items: true } } },
      orderBy: { order: "asc" },
    });
    return NextResponse.json({ albums });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireContentAccess();
    const input = galleryAlbumSchema.parse(await request.json());
    const slug = await ensureUniqueSlug("galleryAlbum", input.slug || input.title);
    const album = await prisma.galleryAlbum.create({
      data: { ...input, slug, description: input.description || null, restaurantId: input.restaurantId || null },
    });
    return NextResponse.json({ album }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
