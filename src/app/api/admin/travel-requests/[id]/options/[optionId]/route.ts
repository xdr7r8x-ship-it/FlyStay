import { NextRequest, NextResponse } from 'next/server';
import { requireRoles } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeAuditLog } from '@/lib/admin-audit';

export async function PATCH(request: NextRequest, { params }: { params: { id: string; optionId: string } }) {
  const authResult = await requireRoles(request, ['ADMIN']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await request.json();
    const data: Record<string, unknown> = {};

    // Only allow updating specific fields - no prices, no booking, no payment
    if (typeof body.titleAr === 'string') data.titleAr = body.titleAr;
    if (typeof body.descriptionAr === 'string') data.descriptionAr = body.descriptionAr;
    if (typeof body.optionType === 'string') data.optionType = body.optionType;
    if (typeof body.priceHintAr === 'string') data.priceHintAr = body.priceHintAr;
    if (typeof body.notes === 'string') data.notes = body.notes;
    
    // Allow status update only to valid statuses
    const ALLOWED_STATUSES = ['DRAFT', 'SENT', 'SELECTED', 'REJECTED', 'ARCHIVED'];
    if (body.status && ALLOWED_STATUSES.includes(body.status)) {
      data.status = body.status;
    }

    const option = await prisma.travelRequestOption.update({
      where: { id: params.optionId },
      data,
    });

    await writeAuditLog({
      request,
      actorId: authResult.user.userId,
      actorRole: authResult.user.role,
      action: 'TRAVEL_REQUEST_OPTION_UPDATED',
      entityType: 'TRAVEL_REQUEST_OPTION',
      entityId: option.id,
      details: {
        requestId: params.id,
        optionId: option.id,
        status: option.status,
      },
    });

    return NextResponse.json({ success: true, data: option });
  } catch (error) {
    console.error('[Admin Option PATCH] Error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'خطأ في الخادم.' } },
      { status: 500 },
    );
  }
}
