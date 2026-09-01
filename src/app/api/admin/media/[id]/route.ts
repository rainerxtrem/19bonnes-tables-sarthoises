import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireContentAccess } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api/handle-error";
import { deleteMedia } from "@/lib/services/media.service";
import { recordAuditLog } from "@/lib/services/audit-log.service";
import { prisma } from "@/lib/db/prisma";

const updateSchema = z.object({
  alt: z.string().trim().max(300).optional(),
  caption: z.string().trim().max(300).optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    await requireContentAccess();
    const { id } = await params;
    const data = updateSchema.parse(await request.json());
    const media = await prisma.media.update({ where: { id }, data });
    return NextResponse.json({ media });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const session = await requireContentAccess();
    const { id } = await params;
    await deleteMedia(id);

    await recordAuditLog({
      userId: session.user.id,
      action: "media.delete",
      entityType: "Media",
      entityId: id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
