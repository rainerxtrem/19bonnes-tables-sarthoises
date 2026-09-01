import { NextResponse, type NextRequest } from "next/server";
import { requireContentAccess } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api/handle-error";
import { restaurantSchema } from "@/lib/validation/restaurant";
import { createRestaurant, listRestaurantsAdmin } from "@/lib/services/restaurant.service";
import { recordAuditLog } from "@/lib/services/audit-log.service";

export async function GET() {
  try {
    await requireContentAccess();
    const restaurants = await listRestaurantsAdmin();
    return NextResponse.json({ restaurants });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireContentAccess();
    const body = await request.json();
    const input = restaurantSchema.parse(body);

    const restaurant = await createRestaurant(input);

    await recordAuditLog({
      userId: session.user.id,
      action: "restaurant.create",
      entityType: "Restaurant",
      entityId: restaurant.id,
      metadata: { name: restaurant.name },
    });

    return NextResponse.json({ restaurant }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
