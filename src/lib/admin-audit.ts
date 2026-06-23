import { NextRequest } from 'next/server';
import { Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';

export async function writeAuditLog(input: {
  request: NextRequest;
  actorId?: string;
  actorRole?: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  details?: Record<string, unknown>;
}) {
  await prisma.auditLog.create({
    data: {
      actorId: input.actorId || null,
      actorRole: input.actorRole || null,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId || null,
      ipAddress: input.request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: input.request.headers.get('user-agent') || 'unknown',
      details: (input.details || {}) as Prisma.InputJsonValue,
    },
  });
}
