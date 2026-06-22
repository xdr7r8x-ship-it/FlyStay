import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUserFromRequest } from '@/lib/auth';
import { createOrderSchema } from '@/lib/validations';
import { PrismaClient } from '@/generated/prisma';

async function generateOrderNumber(client: PrismaClient): Promise<string> {
  const lastOrder = await client.order.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { orderNumber: true },
  });

  const lastNumber = lastOrder
    ? parseInt(lastOrder.orderNumber.replace('FS-', ''))
    : 1000;

  return `FS-${lastNumber + 1}`;
}

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUserFromRequest(request);

    if (!authUser) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { userId: authUser.userId },
      include: {
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
        bookings: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUserFromRequest(request);

    if (!authUser) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const body = await request.json();
    const validation = createOrderSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const orderNumber = await generateOrderNumber(prisma);

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: authUser.userId,
        serviceType: validation.data.serviceType,
        details: validation.data.details ?? {},
      },
      include: {
        bookings: true,
        payments: true,
      },
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}
