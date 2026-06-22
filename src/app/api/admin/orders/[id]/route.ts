/**
 * Admin Order API
 * GET/PATCH /api/admin/orders/[id]
 *
 * Returns or updates a specific order for admin management.
 * Requires ADMIN role.
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRoles } from '@/lib/auth';
import { adminUpdateOrderSchema } from '@/lib/validations';

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

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
        adminNotes: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Admin get order error:', error);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // RBAC: Require ADMIN role
  const authResult = await requireRoles(request, ['ADMIN']);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult as { user: { userId: string; email: string; role: string } };

  try {
    if (!prisma) {
      return NextResponse.json(
        { error: { code: 'SERVICE_NOT_CONFIGURED', message: 'الخدمة غير متاحة حالياً' } },
        { status: 503 }
      );
    }

    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 });
    }

    const body = await request.json();
    const validation = adminUpdateOrderSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { status, note } = validation.data;
    const updates: Record<string, unknown> = {};

    // If status is being changed
    if (status && status !== order.status) {
      updates.status = status;

      // Create status history
      await prisma.orderStatusHistory.create({
        data: {
          orderId: id,
          status,
          note: note || `تم تحديث الحالة بواسطة المدير`,
        },
      });

      // Create notification for user
      const statusLabels: Record<string, string> = {
        NEW: 'جديد',
        REVIEWING: 'قيد المراجعة',
        WAITING_USER: 'في انتظار ردك',
        OFFER_SENT: 'تم إرسال العرض',
        CONFIRMED_MANUALLY: 'تم التأكيد',
        CANCELLED: 'ملغي',
        CLOSED: 'مغلق',
      };

      await prisma.notification.create({
        data: {
          userId: order.userId,
          title: 'تحديث على طلبك',
          message: `تم تحديث حالة طلبك رقم ${order.orderNumber} إلى: ${statusLabels[status] || status}`,
        },
      });
    }

    // If note is provided, add admin note
    if (note) {
      await prisma.adminNote.create({
        data: {
          orderId: id,
          adminId: user.userId,
          note,
        },
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updates,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
        adminNotes: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error('Admin update order error:', error);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}
