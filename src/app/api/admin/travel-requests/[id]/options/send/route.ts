import { NextRequest, NextResponse } from 'next/server';
import { requireRoles } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeAuditLog } from '@/lib/admin-audit';
import { createSystemMessage } from '@/lib/travel-request-messages';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await requireRoles(request, ['ADMIN']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    // Get all DRAFT options for this request
    const draftOptions = await prisma.travelRequestOption.findMany({
      where: {
        requestId: params.id,
        status: 'DRAFT',
      },
    });

    if (draftOptions.length === 0) {
      return NextResponse.json(
        { error: { code: 'NO_OPTIONS', message: 'لا توجد خيارات جاهزة للإرسال.' } },
        { status: 400 },
      );
    }

    // Update all DRAFT options to SENT
    await prisma.travelRequestOption.updateMany({
      where: {
        requestId: params.id,
        status: 'DRAFT',
      },
      data: {
        status: 'SENT',
      },
    });

    // Update request status to OPTIONS_SENT
    const updatedRequest = await prisma.travelRequest.update({
      where: { id: params.id },
      data: {
        status: 'OPTIONS_SENT',
      },
    });

    await writeAuditLog({
      request,
      actorId: authResult.user.userId,
      actorRole: authResult.user.role,
      action: 'TRAVEL_REQUEST_OPTIONS_SENT',
      entityType: 'TRAVEL_REQUEST',
      entityId: params.id,
      details: {
        requestId: params.id,
        referenceNumber: updatedRequest.referenceNumber,
        optionsCount: draftOptions.length,
        newStatus: 'OPTIONS_SENT',
      },
    });

    // Create system message for user
    await createSystemMessage(
      params.id,
      'تم تجهيز خيارات أولية للمراجعة. اختيارك لأي خيار لا يعني إتمام الحجز.',
      'USER',
      'OPTION'
    );

    return NextResponse.json({
      success: true,
      message: 'تم إرسال الخيارات للمستخدم.',
      data: {
        optionsSent: draftOptions.length,
        requestStatus: updatedRequest.status,
      },
    });
  } catch (error) {
    console.error('[Admin Options Send] Error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'خطأ في الخادم.' } },
      { status: 500 },
    );
  }
}
