import { NextResponse, type NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { requireSuperAdmin } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api/handle-error";
import { createUserSchema } from "@/lib/validation/auth";
import { prisma } from "@/lib/db/prisma";
import { recordAuditLog } from "@/lib/services/audit-log.service";

export async function GET() {
  try {
    await requireSuperAdmin();
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        restaurantId: true,
        restaurant: { select: { name: true } },
      },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ users });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireSuperAdmin();
    const input = createUserSchema.parse(await request.json());

    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        role: input.role,
        restaurantId: input.role === "RESTAURATEUR" ? input.restaurantId : null,
        passwordHash: await bcrypt.hash(input.password, 12),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        restaurantId: true,
        restaurant: { select: { name: true } },
      },
    });

    await recordAuditLog({
      userId: session.user.id,
      action: "user.create",
      entityType: "User",
      entityId: user.id,
      metadata: { email: user.email, role: user.role },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
