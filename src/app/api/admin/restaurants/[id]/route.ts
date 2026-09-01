import { NextResponse, type NextRequest } from "next/server";
import { requireContentAccess } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api/handle-error";
import { restaurantSchema } from "@/lib/validation/restaurant";
import {
  deleteRestaurant,
  getRestaurantById,
  updateRestaurant,
} from "@/lib/services/restaurant.service";
import { recordAuditLog } from "@/lib/services/audit-log.service";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    await requireContentAccess();
    const { id } = await params;
    const restaurant = await getRestaurantById(id);
    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant introuvable" }, { status: 404 });
    }
    return NextResponse.json({ restaurant });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const session = await requireContentAccess();
    const { id } = await params;
    const body = await request.json();
    const input = restaurantSchema.parse(body);

    const restaurant = await updateRestaurant(id, input);

    await recordAuditLog({
      userId: session.user.id,
      action: "restaurant.update",
      entityType: "Restaurant",
      entityId: id,
      metadata: { name: restaurant.name },
    });

    return NextResponse.json({ restaurant });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const session = await requireContentAccess();
    const { id } = await params;
    await deleteRestaurant(id);

    await recordAuditLog({
      userId: session.user.id,
      action: "restaurant.delete",
      entityType: "Restaurant",
      entityId: id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
