/**
 * Admin Support API
 * GET /api/admin/support
 *
 * Returns aggregated support items from travel request messages and user activities.
 * FAIL-CLOSED: Returns 503 if database is not configured.
 * Requires ADMIN role.
 * READ-ONLY: No create, update, or delete operations.
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
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Aggregate messages from travel requests
    const messages = await prisma.travelRequestMessage.findMany({
      where: {
        senderRole: 'USER',
      },
      include: {
        request: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    // Transform to support items format
    const items = messages.map(msg => ({
      id: msg.id,
      type: 'message',
      requestId: msg.requestId,
      userId: msg.request.user?.id || '',
      userName: msg.request.user?.name || 'مستخدم',
      userEmail: msg.request.user?.email || '',
      content: msg.bodyAr,
      status: msg.request.status,
      createdAt: msg.createdAt.toISOString(),
    }));

    return NextResponse.json({
      items,
      count: items.length,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Admin support fetch error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'حدث خطأ أثناء جلب البيانات' } },
      { status: 500 }
    );
  }
}
