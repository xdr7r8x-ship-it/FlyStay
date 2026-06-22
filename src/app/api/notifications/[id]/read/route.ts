import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUserFromRequest } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }
    
    const notification = await prisma.notification.findUnique({
      where: { id },
    });
    
    if (!notification) {
      return NextResponse.json({ error: 'الإشعار غير موجود' }, { status: 404 });
    }
    
    // User can only read their own notifications
    if (notification.userId !== user.userId) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }
    
    const updated = await prisma.notification.update({
      where: { id },
      data: { read: true },
    });
    
    return NextResponse.json({ success: true, notification: updated });
  } catch (error) {
    console.error('Mark notification read error:', error);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}
