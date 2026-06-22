import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { getAuthUserFromRequest } from '@/lib/auth';

export async function POST(
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

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 });
    }

    const body = await request.json();
    const { note } = body;

    if (!note || typeof note !== 'string' || note.trim().length === 0) {
      return NextResponse.json({ error: 'الملاحظة مطلوبة' }, { status: 400 });
    }

    const adminNote = await prisma.adminNote.create({
      data: {
        orderId: id,
        adminId: user.userId,
        note: note.trim(),
      },
    });

    return NextResponse.json({ success: true, note: adminNote });
  } catch (error) {
    console.error('Admin create note error:', error);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}
