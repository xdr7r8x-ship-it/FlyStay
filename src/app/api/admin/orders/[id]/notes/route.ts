/**
 * Admin Order Notes API
 * POST /api/admin/orders/[id]/notes
 *
 * Adds a note to a specific order.
 * Requires ADMIN role.
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRoles } from '@/lib/auth';

export async function POST(
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
