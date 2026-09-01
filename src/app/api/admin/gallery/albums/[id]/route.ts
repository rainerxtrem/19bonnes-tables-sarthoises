import { NextResponse, type NextRequest } from "next/server";
import { requireContentAccess } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api/handle-error";
import { galleryAlbumSchema } from "@/lib/validation/gallery";
import { ensureUniqueSlug, slugifyText } from "@/lib/slug";
import { prisma } from "@/lib/db/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    await requireContentAccess();
    const { id } = await params;
    const album = await prisma.galleryAlbum.findUnique({
      where: { id },
      include: { items: { include: { media: true }, orderBy: { order: "asc" } } },
    });
    if (!album) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
    return NextResponse.json({ album });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    await requireContentAccess();
    const { id } = await params;
    const existing = await prisma.galleryAlbum.findUniqueOrThrow({ where: { id } });
    const input = galleryAlbumSchema.parse(await request.json());
    const slug =
      input.slug && slugifyText(input.slug) !== existing.slug
        ? await ensureUniqueSlug("galleryAlbum", input.slug, id)
        : existing.slug;

    const album = await prisma.galleryAlbum.update({
      where: { id },
      data: { ...input, slug, description: input.description || null, restaurantId: input.restaurantId || null },
    });
    return NextResponse.json({ album });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    await requireContentAccess();
    const { id } = await params;
    await prisma.galleryAlbum.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
