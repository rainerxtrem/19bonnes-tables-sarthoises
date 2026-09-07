import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";

// Route de debug ponctuelle : diagnostic du blocage de connexion signalé
// sur /tresorerie/login. Lecture seule, aucun hash de mot de passe exposé.
export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-debug-secret");
  if (!secret || secret !== process.env.DEBUG_TRESORIER_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    where: { role: "TRESORIER" },
    select: { id: true, email: true, name: true, isActive: true, lastLoginAt: true, createdAt: true },
  });

  return NextResponse.json({ count: users.length, users });
}
