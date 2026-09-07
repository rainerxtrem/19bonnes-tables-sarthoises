import { NextResponse, type NextRequest } from "next/server";
import { requireContentAccess } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api/handle-error";
import { eventSchema } from "@/lib/validation/event";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    await requireContentAccess();
    const events = await prisma.event.findMany({ include: { mainImage: true }, orderBy: { startAt: "desc" } });
    return NextResponse.json({ events });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireContentAccess();
    const input = eventSchema.parse(await request.json());
    const event = await prisma.event.create({
      data: { ...input, description: input.description || null, location: input.location || null },
    });
    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
