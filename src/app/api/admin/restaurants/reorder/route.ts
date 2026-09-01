import { NextResponse, type NextRequest } from "next/server";
import { requireContentAccess } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api/handle-error";
import { reorderSchema } from "@/lib/validation/restaurant";
import { reorderRestaurants } from "@/lib/services/restaurant.service";

export async function POST(request: NextRequest) {
  try {
    await requireContentAccess();
    const { items } = reorderSchema.parse(await request.json());
    await reorderRestaurants(items);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
