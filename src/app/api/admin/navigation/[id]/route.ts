import { NextResponse, type NextRequest } from "next/server";
import { requireContentAccess } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api/handle-error";
import { navigationItemSchema } from "@/lib/validation/navigation";
import { prisma } from "@/lib/db/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    await requireContentAccess();
    const { id } = await params;
    const item = await prisma.navigationItem.findUnique({ where: { id } });
    if (!item) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
    return NextResponse.json({ item });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    await requireContentAccess();
    const { id } = await params;
    const input = navigationItemSchema.parse(await request.json());

    if (input.parentId === id) {
      return NextResponse.json({ error: "Un élément ne peut pas être son propre parent" }, { status: 422 });
    }

    const item = await prisma.navigationItem.update({
      where: { id },
      data: { ...input, url: input.url || null },
    });
    return NextResponse.json({ item });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    await requireContentAccess();
    const { id } = await params;
    await prisma.navigationItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
