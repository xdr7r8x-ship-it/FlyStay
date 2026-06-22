/**
 * Admin Offer API
 * PATCH/DELETE /api/admin/offers/[id]
 *
 * Updates or deletes a specific offer.
 * Requires ADMIN role.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { requireRoles } from '@/lib/auth';
import { updateOfferSchema } from '@/lib/validations';

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
    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json(
        { error: { code: 'SERVICE_NOT_CONFIGURED', message: 'الخدمة غير متاحة حالياً' } },
        { status: 503 }
      );
    }

    const { id } = await params;

    const offer = await prisma.offer.findUnique({
      where: { id },
    });

    if (!offer) {
      return NextResponse.json({ error: 'العرض غير موجود' }, { status: 404 });
    }

    const body = await request.json();
    const validation = updateOfferSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { title, description, code, active } = validation.data;

    const updatedOffer = await prisma.offer.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(code !== undefined && { code }),
        ...(active !== undefined && { active }),
      },
    });

    return NextResponse.json({ success: true, offer: updatedOffer });
  } catch (error) {
    console.error('Admin update offer error:', error);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}
