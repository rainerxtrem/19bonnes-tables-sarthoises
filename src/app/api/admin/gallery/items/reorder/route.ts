import { NextResponse, type NextRequest } from "next/server";
import { requireContentAccess } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api/handle-error";
import { reorderGalleryItemsSchema } from "@/lib/validation/gallery";
import { prisma } from "@/lib/db/prisma";

export async function POST(request: NextRequest) {
  try {
    await requireContentAccess();
    const { items } = reorderGalleryItemsSchema.parse(await request.json());
    await prisma.$transaction(
      items.map((item) => prisma.galleryItem.update({ where: { id: item.id }, data: { order: item.order } }))
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
