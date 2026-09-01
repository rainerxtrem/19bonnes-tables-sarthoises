import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireContentAccess } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api/handle-error";
import { prisma } from "@/lib/db/prisma";

const bodySchema = z.object({ status: z.enum(["UNREAD", "READ", "ARCHIVED"]) });

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    await requireContentAccess();
    const { id } = await params;
    const { status } = bodySchema.parse(await request.json());

    const message = await prisma.contactMessage.update({
      where: { id },
      data: {
        status,
        readAt: status === "READ" ? new Date() : undefined,
        archivedAt: status === "ARCHIVED" ? new Date() : null,
      },
    });

    return NextResponse.json({ message });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    await requireContentAccess();
    const { id } = await params;
    await prisma.contactMessage.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
