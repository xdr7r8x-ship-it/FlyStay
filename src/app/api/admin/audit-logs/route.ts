/**
 * Audit Logs API
 * GET /api/admin/audit-logs
 * 
 * Returns recent audit logs from database.
 * Requires authentication - should be protected by auth middleware.
 * FAIL-CLOSED: Returns 503 if database is not configured.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const querySchema = z.object({
  userId: z.string().optional(),
  action: z.string().optional(),
  resource: z.string().optional(),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional(),
  offset: z.string().transform(Number).pipe(z.number().min(0)).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = querySchema.parse({
      userId: searchParams.get('userId'),
      action: searchParams.get('action'),
      resource: searchParams.get('resource'),
      limit: searchParams.get('limit') || '50',
      offset: searchParams.get('offset') || '0',
    });

    // Check if database is configured
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: { code: 'SERVICE_NOT_CONFIGURED', message: 'قاعدة البيانات غير مهيأة' } },
        { status: 503 }
      );
    }

    try {
      // Dynamic import to avoid issues when DATABASE_URL is not set
      const { prisma } = await import('@/lib/prisma');
      
      const where: Record<string, unknown> = {};
      if (query.userId) where.userId = query.userId;
      if (query.action) where.action = query.action;
      if (query.resource) where.resource = query.resource;

      const logs = await prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: query.limit,
        skip: query.offset,
      });

      return NextResponse.json({
        data: logs,
        count: logs.length,
      });
    } catch {
      return NextResponse.json(
        { error: { code: 'SERVICE_NOT_CONFIGURED', message: 'قاعدة البيانات غير مهيأة' } },
        { status: 503 }
      );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'بيانات غير صالحة' } },
        { status: 400 }
      );
    }
    console.error('Audit logs error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'خطأ في الخادم' } },
      { status: 500 }
    );
  }
}
