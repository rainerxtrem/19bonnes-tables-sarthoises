import { NextResponse, type NextRequest } from "next/server";
import { requireContentAccess } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api/handle-error";
import { reorderNavigationSchema } from "@/lib/validation/navigation";
import { prisma } from "@/lib/db/prisma";

export async function POST(request: NextRequest) {
  try {
    await requireContentAccess();
    const { items } = reorderNavigationSchema.parse(await request.json());

    await prisma.$transaction(
      items.map((item) =>
        prisma.navigationItem.update({
          where: { id: item.id },
          data: { order: item.order, parentId: item.parentId },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
