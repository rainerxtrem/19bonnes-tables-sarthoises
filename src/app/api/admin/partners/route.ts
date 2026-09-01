import { NextResponse, type NextRequest } from "next/server";
import { requireContentAccess } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api/handle-error";
import { partnerSchema } from "@/lib/validation/partner";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    await requireContentAccess();
    const partners = await prisma.partner.findMany({ include: { logo: true }, orderBy: { order: "asc" } });
    return NextResponse.json({ partners });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireContentAccess();
    const input = partnerSchema.parse(await request.json());
    const partner = await prisma.partner.create({
      data: { ...input, description: input.description || null, websiteUrl: input.websiteUrl || null },
    });
    return NextResponse.json({ partner }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
