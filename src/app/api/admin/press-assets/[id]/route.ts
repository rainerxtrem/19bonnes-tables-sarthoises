import { NextResponse, type NextRequest } from "next/server";
import { requireContentAccess } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api/handle-error";
import { pressAssetSchema } from "@/lib/validation/press-asset";
import { prisma } from "@/lib/db/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    await requireContentAccess();
    const { id } = await params;
    const asset = await prisma.pressAsset.findUnique({ where: { id }, include: { media: true } });
    if (!asset) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
    return NextResponse.json({ asset });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    await requireContentAccess();
    const { id } = await params;
    const input = pressAssetSchema.parse(await request.json());
    const asset = await prisma.pressAsset.update({
      where: { id },
      data: { ...input, description: input.description || null },
    });
    return NextResponse.json({ asset });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    await requireContentAccess();
    const { id } = await params;
    await prisma.pressAsset.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
