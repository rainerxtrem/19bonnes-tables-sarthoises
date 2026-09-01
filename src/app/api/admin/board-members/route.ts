import { NextResponse, type NextRequest } from "next/server";
import { requireContentAccess } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api/handle-error";
import { boardMemberSchema } from "@/lib/validation/board-member";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    await requireContentAccess();
    const members = await prisma.boardMember.findMany({
      include: { photo: true, restaurant: { select: { name: true } } },
      orderBy: { order: "asc" },
    });
    return NextResponse.json({ members });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireContentAccess();
    const input = boardMemberSchema.parse(await request.json());
    const member = await prisma.boardMember.create({ data: { ...input, bio: input.bio || null } });
    return NextResponse.json({ member }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
