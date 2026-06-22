/**
 * Audit Logs API
 * GET /api/admin/audit-logs
 *
 * Returns recent audit logs from database.
 * FAIL-CLOSED: Returns 503 if database is not configured.
 * Requires ADMIN role.
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRoles } from '@/lib/auth';

export async function GET(request: NextRequest) {
  // RBAC: Require ADMIN role
  const authResult = await requireRoles(request, ['ADMIN']);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    if (!prisma) {
      return NextResponse.json(
        { error: { code: 'SERVICE_NOT_CONFIGURED', message: 'الخدمة غير متاحة حالياً' } },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    
    // Map query params to correct Prisma schema fields
    const actorId = searchParams.get('userId') || searchParams.get('actorId');
    const action = searchParams.get('action');
    const entityType = searchParams.get('entityType') || searchParams.get('resource');
    const entityId = searchParams.get('entityId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: Record<string, unknown> = {};
    if (actorId) where.actorId = actorId;
    if (action) where.action = action;
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    return NextResponse.json({
      data: logs,
      count: logs.length,
    });
  } catch (error) {
    console.error('Audit logs error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'خطأ في الخادم' } },
      { status: 500 }
    );
  }
}
