import { NextResponse, type NextRequest } from "next/server";
import { requireContentAccess } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api/handle-error";
import { pressAssetSchema } from "@/lib/validation/press-asset";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    await requireContentAccess();
    const assets = await prisma.pressAsset.findMany({ include: { media: true }, orderBy: { order: "asc" } });
    return NextResponse.json({ assets });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireContentAccess();
    const input = pressAssetSchema.parse(await request.json());
    const asset = await prisma.pressAsset.create({
      data: { ...input, description: input.description || null },
    });
    return NextResponse.json({ asset }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
