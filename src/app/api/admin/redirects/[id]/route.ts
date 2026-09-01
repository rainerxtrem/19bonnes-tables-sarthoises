import { NextResponse, type NextRequest } from "next/server";
import { requireSuperAdmin } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api/handle-error";
import { redirectSchema } from "@/lib/validation/redirect";
import { prisma } from "@/lib/db/prisma";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    await requireSuperAdmin();
    const { id } = await params;
    const input = redirectSchema.parse(await request.json());
    const redirect = await prisma.redirect.update({ where: { id }, data: input });
    return NextResponse.json({ redirect });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    await requireSuperAdmin();
    const { id } = await params;
    await prisma.redirect.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
