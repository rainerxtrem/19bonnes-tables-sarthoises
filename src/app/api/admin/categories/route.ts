import { NextResponse, type NextRequest } from "next/server";
import { requireContentAccess } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api/handle-error";
import { categorySchema } from "@/lib/validation/article";
import { ensureUniqueSlug } from "@/lib/slug";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    await requireContentAccess();
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { articles: true } } },
    });
    return NextResponse.json({ categories });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireContentAccess();
    const input = categorySchema.parse(await request.json());
    const slug = await ensureUniqueSlug("category", input.slug || input.name);
    const category = await prisma.category.create({ data: { name: input.name, slug } });
    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
