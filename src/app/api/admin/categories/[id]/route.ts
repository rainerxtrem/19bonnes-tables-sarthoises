import { NextResponse, type NextRequest } from "next/server";
import { requireContentAccess } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api/handle-error";
import { categorySchema } from "@/lib/validation/article";
import { ensureUniqueSlug, slugifyText } from "@/lib/slug";
import { prisma } from "@/lib/db/prisma";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    await requireContentAccess();
    const { id } = await params;
    const input = categorySchema.parse(await request.json());
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

    const slug =
      input.slug && slugifyText(input.slug) !== existing.slug
        ? await ensureUniqueSlug("category", input.slug, id)
        : existing.slug;

    const category = await prisma.category.update({ where: { id }, data: { name: input.name, slug } });
    return NextResponse.json({ category });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    await requireContentAccess();
    const { id } = await params;
    // Les articles rattachés ne sont pas supprimés : la relation passe à
    // null (onDelete: SetNull dans le schéma), ils redeviennent juste
    // "sans catégorie".
    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
