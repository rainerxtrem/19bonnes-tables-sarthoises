import { NextResponse, type NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { requireSuperAdmin } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api/handle-error";
import { updateUserSchema } from "@/lib/validation/auth";
import { prisma } from "@/lib/db/prisma";
import { recordAuditLog } from "@/lib/services/audit-log.service";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const session = await requireSuperAdmin();
    const { id } = await params;
    const input = updateUserSchema.parse(await request.json());

    if (id === session.user.id && input.isActive === false) {
      return NextResponse.json({ error: "Vous ne pouvez pas désactiver votre propre compte" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        name: input.name,
        email: input.email,
        role: input.role,
        restaurantId: input.role ? (input.role === "RESTAURATEUR" ? input.restaurantId : null) : undefined,
        isActive: input.isActive,
        passwordHash: input.password ? await bcrypt.hash(input.password, 12) : undefined,
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

    await recordAuditLog({ userId: session.user.id, action: "user.update", entityType: "User", entityId: id });

    return NextResponse.json({ user });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const session = await requireSuperAdmin();
    const { id } = await params;

    if (id === session.user.id) {
      return NextResponse.json({ error: "Vous ne pouvez pas supprimer votre propre compte" }, { status: 400 });
    }

    await prisma.user.delete({ where: { id } });

    await recordAuditLog({ userId: session.user.id, action: "user.delete", entityType: "User", entityId: id });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
