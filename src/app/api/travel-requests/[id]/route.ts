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
    { error: { code: 'FORBIDDEN', message: 'غير مصرح لك访问 هذا الطلب.' } },
    { status: 403 },
  );
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUserFromRequest(request);
  if (!user?.userId) return unauthorized();

  try {
    const travelRequest = await prisma.travelRequest.findUnique({
      where: { id: params.id },
      include: {
        destination: {
          select: { id: true, slug: true, cityAr: true, countryAr: true },
        },
        template: {
          select: { id: true, slug: true, titleAr: true },
        },
        stayGuide: {
          select: { id: true, titleAr: true, cityAr: true, type: true },
        },
      },
    });

    if (!travelRequest) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'الطلب غير موجود.' } },
        { status: 404 },
      );
    }

    // User can only see their own requests
    if (travelRequest.userId !== user.userId) {
      return forbidden();
    }

    // Safe response - exclude sensitive fields
    const safeResponse = {
      id: travelRequest.id,
      referenceNumber: travelRequest.referenceNumber,
      serviceType: travelRequest.serviceType,
      sourceType: travelRequest.sourceType,
      cityAr: travelRequest.cityAr,
      startDate: travelRequest.startDate,
      endDate: travelRequest.endDate,
      guests: travelRequest.guests,
      rooms: travelRequest.rooms,
      budgetLevel: travelRequest.budgetLevel,
      notes: travelRequest.notes,
      status: travelRequest.status,
      paymentStatus: travelRequest.paymentStatus,
      bookingStatus: travelRequest.bookingStatus,
      createdAt: travelRequest.createdAt,
      updatedAt: travelRequest.updatedAt,
      destination: travelRequest.destination,
      template: travelRequest.template,
      stayGuide: travelRequest.stayGuide,
    };

    return NextResponse.json({ data: safeResponse });
  } catch (error) {
    console.error('[Travel Request GET] Error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'خطأ في الخادم.' } },
      { status: 500 },
    );
  }
}
