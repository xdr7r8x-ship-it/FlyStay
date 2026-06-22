import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { getAuthUserFromRequest } from '@/lib/auth';
import { updateOrderSchema } from '@/lib/validations';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json(
        { error: { code: 'SERVICE_NOT_CONFIGURED', message: 'الخدمة غير متاحة حالياً' } },
        { status: 503 }
      );
    }

    const { id } = await params;
    const user = await getAuthUserFromRequest(request);

    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
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

    // User can only access their own orders (unless admin)
    if (order.userId !== user.userId && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json(
        { error: { code: 'SERVICE_NOT_CONFIGURED', message: 'الخدمة غير متاحة حالياً' } },
        { status: 503 }
      );
    }

    const { id } = await params;
    const user = await getAuthUserFromRequest(request);

    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 });
    }

    // User can only update their own orders
    if (order.userId !== user.userId) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    // User cannot update orders that are being processed by admin
    if (['OFFER_SENT', 'CONFIRMED_MANUALLY', 'CLOSED'].includes(order.status)) {
      return NextResponse.json(
        { error: 'لا يمكن تعديل هذا الطلب حالياً' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validation = updateOrderSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, phone, notes, details } = validation.data;

    const updateData: Record<string, unknown> = {};

    if (name) {
      const currentDetails = order.details as Record<string, unknown>;
      updateData.details = { ...currentDetails, name };
    }

    if (phone) {
      const currentDetails = order.details as Record<string, unknown>;
      updateData.details = { ...currentDetails, phone };
    }

    if (notes) {
      const currentDetails = order.details as Record<string, unknown>;
      updateData.details = { ...currentDetails, notes };
    }

    if (details) {
      const currentDetails = order.details as Record<string, unknown>;
      updateData.details = { ...currentDetails, ...details };
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}
