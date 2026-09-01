import { NextResponse, type NextRequest } from "next/server";
import { requireContentAccess } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api/handle-error";
import { categorySchema } from "@/lib/validation/article";
import { slugifyText } from "@/lib/slug";
import { prisma } from "@/lib/db/prisma";

async function ensureUniqueCategorySlug(base: string): Promise<string> {
  const baseSlug = slugifyText(base) || "categorie";
  let candidate = baseSlug;
  let attempt = 1;
  while (await prisma.category.findUnique({ where: { slug: candidate } })) {
    attempt += 1;
    candidate = `${baseSlug}-${attempt}`;
  }
  return candidate;
}

export async function GET() {
  try {
    await requireContentAccess();
    const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
    return NextResponse.json({ categories });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireContentAccess();
    const input = categorySchema.parse(await request.json());
    const slug = await ensureUniqueCategorySlug(input.slug || input.name);
    const category = await prisma.category.create({ data: { name: input.name, slug } });
    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
