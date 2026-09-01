import { NextResponse, type NextRequest } from "next/server";
import { requireContentAccess } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api/handle-error";
import { partnerSchema } from "@/lib/validation/partner";
import { prisma } from "@/lib/db/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    await requireContentAccess();
    const { id } = await params;
    const partner = await prisma.partner.findUnique({ where: { id }, include: { logo: true } });
    if (!partner) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
    return NextResponse.json({ partner });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    await requireContentAccess();
    const { id } = await params;
    const input = partnerSchema.parse(await request.json());
    const partner = await prisma.partner.update({
      where: { id },
      data: { ...input, description: input.description || null, websiteUrl: input.websiteUrl || null },
    });
    return NextResponse.json({ partner });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    await requireContentAccess();
    const { id } = await params;
    await prisma.partner.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
