import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireContentAccess } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api/handle-error";
import { setRestaurantStatus } from "@/lib/services/restaurant.service";
import { recordAuditLog } from "@/lib/services/audit-log.service";

const bodySchema = z.object({ status: z.enum(["PUBLISHED", "ARCHIVED"]) });

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireContentAccess();
    const { id } = await params;
    const { status } = bodySchema.parse(await request.json());

    const restaurant = await setRestaurantStatus(id, status);

    await recordAuditLog({
      userId: session.user.id,
      action: status === "PUBLISHED" ? "restaurant.publish" : "restaurant.archive",
      entityType: "Restaurant",
      entityId: id,
    });

    return NextResponse.json({ restaurant });
  } catch (error) {
    return handleApiError(error);
  }
}
