import { NextResponse, type NextRequest } from "next/server";
import { requireMediaAccess } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api/handle-error";
import { uploadMedia } from "@/lib/services/media.service";
import { recordAuditLog } from "@/lib/services/audit-log.service";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
  try {
    await requireMediaAccess();
    const search = request.nextUrl.searchParams.get("q")?.trim();
    const type = request.nextUrl.searchParams.get("type");

    const media = await prisma.media.findMany({
      where: {
        ...(search
          ? { OR: [{ filename: { contains: search, mode: "insensitive" } }, { alt: { contains: search, mode: "insensitive" } }] }
          : {}),
        ...(type ? { type: type as "IMAGE" | "DOCUMENT" | "VIDEO" } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return NextResponse.json({ media });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireMediaAccess();
    const formData = await request.formData();
    const file = formData.get("file");
    const alt = formData.get("alt");
    const caption = formData.get("caption");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });
    }

    const media = await uploadMedia({
      file,
      alt: typeof alt === "string" ? alt : undefined,
      caption: typeof caption === "string" ? caption : undefined,
      uploadedById: session.user.id,
    });

    await recordAuditLog({
      userId: session.user.id,
      action: "media.upload",
      entityType: "Media",
      entityId: media.id,
      metadata: { filename: media.filename },
    });

    return NextResponse.json({ media }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
