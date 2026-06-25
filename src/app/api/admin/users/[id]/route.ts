/**
 * Admin User Details API
 * GET /api/admin/users/[id]
 *
 * Returns detailed user information from database.
 * FAIL-CLOSED: Returns 503 if database is not configured.
 * Requires ADMIN role.
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRoles } from '@/lib/auth';

export async function GET(
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

    // Fetch user with related data
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            orders: true,
            travelRequests: true,
            bookings: true,
            notifications: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'المستخدم غير موجود' } },
        { status: 404 }
      );
    }

    // Fetch recent travel requests
    const recentRequests = await prisma.travelRequest.findMany({
      where: { userId: id },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        status: true,
        cityAr: true,
        serviceType: true,
        createdAt: true,
        updatedAt: true,
        destination: {
          select: {
            cityAr: true,
          },
        },
        _count: {
          select: {
            options: true,
          },
        },
      },
    });

    // Fetch recent messages
    const recentMessages = await prisma.travelRequestMessage.findMany({
      where: {
        senderId: id,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        bodyAr: true,
        senderRole: true,
        createdAt: true,
        requestId: true,
      },
    });

    // Fetch recent notifications
    const recentNotifications = await prisma.notification.findMany({
      where: { userId: id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        message: true,
        read: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      user,
      recentRequests,
      recentMessages,
      recentNotifications,
    });
  } catch (error) {
    console.error('Admin user details fetch error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'حدث خطأ أثناء جلب البيانات' } },
      { status: 500 }
    );
  }
}
