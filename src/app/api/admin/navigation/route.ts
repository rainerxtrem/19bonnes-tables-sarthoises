import { NextResponse, type NextRequest } from "next/server";
import { requireContentAccess } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api/handle-error";
import { navigationItemSchema } from "@/lib/validation/navigation";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    await requireContentAccess();
    const items = await prisma.navigationItem.findMany({
      include: { page: { select: { title: true, slug: true } }, parent: { select: { label: true } } },
      orderBy: { order: "asc" },
    });
    return NextResponse.json({ items });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireContentAccess();
    const input = navigationItemSchema.parse(await request.json());
    const item = await prisma.navigationItem.create({
      data: { ...input, url: input.url || null },
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
