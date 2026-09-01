import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";

export async function recordAuditLog(params: {
  userId: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Prisma.InputJsonValue;
  ipAddress?: string | null;
}) {
  await prisma.auditLog.create({
    data: {
      userId: params.userId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      metadata: params.metadata,
      ipAddress: params.ipAddress ?? undefined,
    },
  });
}
