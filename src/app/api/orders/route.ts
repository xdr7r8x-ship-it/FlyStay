import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { getAuthUserFromRequest } from '@/lib/auth';
import { createOrderSchema } from '@/lib/validations';

async function generateOrderNumber(prismaClient: NonNullable<ReturnType<typeof getPrisma>>): Promise<string> {
  const lastOrder = await prismaClient.order.findFirst({
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
    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json(
        { error: { code: 'SERVICE_NOT_CONFIGURED', message: 'الخدمة غير متاحة حالياً' } },
        { status: 503 }
      );
    }

    const user = await getAuthUserFromRequest(request);

    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { userId: user.userId },
      include: {
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json(
        { error: { code: 'SERVICE_NOT_CONFIGURED', message: 'الخدمة غير متاحة حالياً' } },
        { status: 503 }
      );
    }

    const user = await getAuthUserFromRequest(request);

    // Allow unauthenticated orders but link to user if logged in
    const body = await request.json();

    const validation = createOrderSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, phone, email, serviceType, date, travelers, notes, details } = validation.data;

    const orderNumber = await generateOrderNumber(prisma);

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: user?.userId || 'guest',
        serviceType,
        status: 'NEW',
        details: {
          name,
          phone,
          email,
          date: date || null,
          travelers: travelers || 1,
          notes: notes || null,
          ...details,
        },
        statusHistory: {
          create: {
            status: 'NEW',
            note: 'تم إنشاء الطلب',
          },
        },
      },
      include: {
        statusHistory: true,
      },
    });

    // Create notification for the user if logged in
    if (user) {
      await prisma.notification.create({
        data: {
          userId: user.userId,
          title: 'تم استلام طلبك',
          message: `تم استلام طلبك رقم ${orderNumber} بنجاح. سيتواصل معك فريقنا قريباً.`,
        },
      });
    }

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء الطلب' },
      { status: 500 }
    );
  }
}
