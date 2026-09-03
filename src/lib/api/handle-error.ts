import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { ForbiddenError, UnauthorizedError } from "@/lib/auth/permissions";
import { VoucherNotFoundError, VoucherNotRedeemableError } from "@/lib/services/gift-voucher.service";

export function handleApiError(error: unknown) {
  if (error instanceof UnauthorizedError) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
  if (error instanceof ForbiddenError) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
  if (error instanceof VoucherNotFoundError) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
  if (error instanceof VoucherNotRedeemableError) {
    return NextResponse.json({ error: error.message, status: error.status }, { status: 409 });
  }
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Données invalides", issues: error.flatten() },
      { status: 422 }
    );
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Ressource introuvable" }, { status: 404 });
    }
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Cette valeur existe déjà (conflit d'unicité)" }, { status: 409 });
    }
  }

  console.error(error);
  return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
}
