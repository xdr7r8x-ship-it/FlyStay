/**
 * Admin Mark Notification as Read API
 * PATCH /api/admin/notifications/[id]/read
 *
 * Marks a notification as read.
 * FAIL-CLOSED: Returns 503 if database is not configured.
 * Requires ADMIN role.
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRoles } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    const notification = await prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    return NextResponse.json({ success: true, notification });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'حدث خطأ أثناء تحديث الإشعار' } },
      { status: 500 }
    );
  }
}
