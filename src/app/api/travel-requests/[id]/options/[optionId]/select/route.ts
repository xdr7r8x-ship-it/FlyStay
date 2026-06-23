import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createSystemMessage } from '@/lib/travel-request-messages';
import { writeAuditLog } from '@/lib/admin-audit';

function unauthorized() {
  return NextResponse.json(
    { error: { code: 'UNAUTHORIZED', message: 'يلزم تسجيل الدخول.' } },
    { status: 401 },
  );
}

function forbidden() {
  return NextResponse.json(
    { error: { code: 'FORBIDDEN', message: 'غير مصرح لك بهذا الإجراء.' } },
    { status: 403 },
  );
}

export async function POST(request: NextRequest, { params }: { params: { id: string; optionId: string } }) {
  const user = await getAuthUserFromRequest(request);
  if (!user?.userId) return unauthorized();

  try {
    // Get the request to verify ownership
    const travelRequest = await prisma.travelRequest.findUnique({
      where: { id: params.id },
    });

    if (!travelRequest) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'الطلب غير موجود.' } },
        { status: 404 },
      );
    }

    if (travelRequest.userId !== user.userId) {
      return forbidden();
    }

    // Verify option exists and belongs to this request
    const option = await prisma.travelRequestOption.findUnique({
      where: { id: params.optionId },
    });

    if (!option || option.requestId !== params.id) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'الخيار غير موجود.' } },
        { status: 404 },
      );
    }

    // Only allow selecting SENT options
    if (option.status !== 'SENT') {
      return NextResponse.json(
        { error: { code: 'INVALID_STATUS', message: 'لا يمكن اختيار هذا الخيار.' } },
        { status: 400 },
      );
    }

    // Reject all other SENT options for this request
    await prisma.travelRequestOption.updateMany({
      where: {
        requestId: params.id,
        status: 'SENT',
        id: { not: params.optionId },
      },
      data: {
        status: 'REJECTED',
      },
    });

    // Select this option
    const updatedOption = await prisma.travelRequestOption.update({
      where: { id: params.optionId },
      data: {
        status: 'SELECTED',
      },
    });

    // Update request status to USER_APPROVED
    const updatedRequest = await prisma.travelRequest.update({
      where: { id: params.id },
      data: {
        status: 'USER_APPROVED',
      },
    });

    // Create system message for user
    await createSystemMessage(
      params.id,
      'تم استلام اختيارك. سيقوم فريق FlyStay بمراجعة التفاصيل يدويًا قبل أي إجراء.',
      'USER',
      'OPTION'
    );

    await writeAuditLog({
      request,
      actorId: user.userId,
      actorRole: user.role || 'USER',
      action: 'TRAVEL_REQUEST_OPTION_SELECTED',
      entityType: 'TRAVEL_REQUEST',
      entityId: params.id,
      details: {
        requestId: params.id,
        selectedOptionId: params.optionId,
        requestStatus: updatedRequest.status,
        optionStatus: updatedOption.status,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'تم اختيار الخيار. بانتظار الإجراء اليدوي من فريق FlyStay.',
      data: {
        option: updatedOption,
        requestStatus: updatedRequest.status,
      },
    });
  } catch (error) {
    console.error('[Select Option] Error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'خطأ في الخادم.' } },
      { status: 500 },
    );
  }
}
