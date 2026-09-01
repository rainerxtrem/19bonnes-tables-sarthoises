import { NextResponse, type NextRequest } from "next/server";
import { requireContentAccess } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api/handle-error";
import { duplicateRestaurant } from "@/lib/services/restaurant.service";
import { recordAuditLog } from "@/lib/services/audit-log.service";

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireContentAccess();
    const { id } = await params;
    const restaurant = await duplicateRestaurant(id);

    await recordAuditLog({
      userId: session.user.id,
      action: "restaurant.duplicate",
      entityType: "Restaurant",
      entityId: restaurant.id,
      metadata: { sourceId: id },
    });

    return NextResponse.json({ restaurant }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
