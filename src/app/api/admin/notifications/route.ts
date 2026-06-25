import { NextRequest, NextResponse } from 'next/server';
import { requireRoles } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const authResult = await requireRoles(request, ['ADMIN']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const userId = searchParams.get('userId');
    const read = searchParams.get('read');

    const where: any = {};
    if (userId) where.userId = userId;
    if (read !== null && read !== undefined) where.read = read === 'true';

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.notification.count({ where }),
    ]);

    return NextResponse.json({
      notifications,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'خطأ في جلب الإشعارات' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireRoles(request, ['ADMIN']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await request.json();
    const { userId, title, message, sendToAll } = body;

    if (!title || !message) {
      return NextResponse.json({ error: 'العنوان والرسالة مطلوبة' }, { status: 400 });
    }

    if (sendToAll) {
      // Send to all users
      const users = await prisma.user.findMany({
        select: { id: true },
      });

      const notifications = await prisma.notification.createMany({
        data: users.map(user => ({
          userId: user.id,
          title,
          message,
          read: false,
        })),
      });

      return NextResponse.json({ success: true, count: notifications.count });
    } else if (userId) {
      // Send to specific user
      const notification = await prisma.notification.create({
        data: {
          userId,
          title,
          message,
          read: false,
        },
      });

      return NextResponse.json({ success: true, notification });
    }

    return NextResponse.json({ error: 'معرف المستخدم مطلوب أو حدد إرسال للجميع' }, { status: 400 });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json({ error: 'خطأ في إنشاء الإشعار' }, { status: 500 });
  }
}
