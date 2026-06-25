/**
 * Admin Mark All Notifications as Read API
 * POST /api/admin/notifications/read-all
 *
 * Marks all notifications as read.
 * FAIL-CLOSED: Returns 503 if database is not configured.
 * Requires ADMIN role.
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRoles } from '@/lib/auth';

export async function POST(request: NextRequest) {
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

    // Get the current user from auth
    const userResponse = await fetch(new URL('/api/auth/me', request.url), {
      credentials: 'include'
    });
    
    if (!userResponse.ok) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'غير مصرح' } },
        { status: 401 }
      );
    }

    const userData = await userResponse.json();
    const userId = userData.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'غير مصرح' } },
        { status: 401 }
      );
    }

    // Mark all unread notifications as read
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: { read: true },
    });

    return NextResponse.json({ 
      success: true, 
      count: result.count 
    });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'حدث خطأ أثناء تحديث الإشعارات' } },
      { status: 500 }
    );
  }
}
