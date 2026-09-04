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

const AUDIT_LOG_PAGE_SIZE = 50;

/** Journal d'activité admin — pagination simple, le plus récent en premier. */
export async function listAuditLogs(page = 1) {
  const skip = (page - 1) * AUDIT_LOG_PAGE_SIZE;
  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: AUDIT_LOG_PAGE_SIZE,
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.auditLog.count(),
  ]);

  return { logs, total, page, pageSize: AUDIT_LOG_PAGE_SIZE, pageCount: Math.max(1, Math.ceil(total / AUDIT_LOG_PAGE_SIZE)) };
}
