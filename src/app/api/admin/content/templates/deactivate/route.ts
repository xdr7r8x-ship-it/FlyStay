import { NextRequest, NextResponse } from 'next/server';
import { requireRoles } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeAuditLog } from '@/lib/admin-audit';

export async function PATCH(request: NextRequest) {
  const authResult = await requireRoles(request, ['ADMIN']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await request.json();
    const { slugs } = body;

    if (!Array.isArray(slugs) || slugs.length === 0) {
      return NextResponse.json(
        { error: { code: 'INVALID_REQUEST', message: 'slugs must be a non-empty array' } },
        { status: 400 }
      );
    }

    const templates = await prisma.tripTemplate.updateMany({
      where: { slug: { in: slugs } },
      data: { status: 'INACTIVE' },
    });

    for (const slug of slugs) {
      await writeAuditLog({
        request,
        actorId: authResult.user.userId,
        actorRole: authResult.user.role,
        action: 'CONTENT_DEACTIVATED',
        entityType: 'TRIP_TEMPLATE',
        entityId: slug,
        details: { slug, action: 'deactivate' },
      });
    }

    return NextResponse.json({ 
      success: true, 
      count: templates.count,
      deactivated: slugs 
    });
  } catch (error) {
    console.error('[Templates Deactivate] Error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'خطأ في الخادم' } },
      { status: 500 }
    );
  }
}
