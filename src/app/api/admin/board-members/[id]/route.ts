import { NextResponse, type NextRequest } from "next/server";
import { requireContentAccess } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api/handle-error";
import { boardMemberSchema } from "@/lib/validation/board-member";
import { prisma } from "@/lib/db/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    await requireContentAccess();
    const { id } = await params;
    const member = await prisma.boardMember.findUnique({ where: { id }, include: { photo: true } });
    if (!member) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
    return NextResponse.json({ member });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    await requireContentAccess();
    const { id } = await params;
    const input = boardMemberSchema.parse(await request.json());
    const member = await prisma.boardMember.update({
      where: { id },
      data: { ...input, bio: input.bio || null },
    });
    return NextResponse.json({ member });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    await requireContentAccess();
    const { id } = await params;
    await prisma.boardMember.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
