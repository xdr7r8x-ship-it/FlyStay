import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Only allow rejecting if there are SENT options
    const sentOptions = await prisma.travelRequestOption.count({
      where: {
        requestId: params.id,
        status: 'SENT',
      },
    });

    if (sentOptions === 0) {
      return NextResponse.json(
        { error: { code: 'NO_OPTIONS', message: 'لا توجد خيارات للمراجعة.' } },
        { status: 400 },
      );
    }

    // Reject all SENT options
    await prisma.travelRequestOption.updateMany({
      where: {
        requestId: params.id,
        status: 'SENT',
      },
      data: {
        status: 'REJECTED',
      },
    });

    // Update request status back to REVIEWING
    const updatedRequest = await prisma.travelRequest.update({
      where: { id: params.id },
      data: {
        status: 'REVIEWING',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'تم رفض الخيارات. سيتواصل معك فريقنا.',
      data: {
        requestStatus: updatedRequest.status,
      },
    });
  } catch (error) {
    console.error('[Reject Options] Error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'خطأ في الخادم.' } },
      { status: 500 },
    );
  }
}
