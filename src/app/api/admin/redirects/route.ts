import { NextResponse, type NextRequest } from "next/server";
import { requireSuperAdmin } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api/handle-error";
import { redirectSchema } from "@/lib/validation/redirect";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    await requireSuperAdmin();
    const redirects = await prisma.redirect.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ redirects });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireSuperAdmin();
    const input = redirectSchema.parse(await request.json());
    const redirect = await prisma.redirect.create({ data: input });
    return NextResponse.json({ redirect }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
