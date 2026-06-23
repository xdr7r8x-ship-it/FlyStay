import { NextRequest, NextResponse } from 'next/server';
import { requireRoles } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeAuditLog } from '@/lib/admin-audit';

const ALLOWED_STATUS = ['NEW', 'REVIEWING', 'OPTIONS_SENT', 'USER_APPROVED', 'BOOKING_PENDING', 'COMPLETED', 'CANCELLED'];
const ALLOWED_PAYMENT_STATUS = ['CREATED', 'PENDING', 'FAILED', 'CANCELLED', 'REFUNDED'];
const ALLOWED_BOOKING_STATUS = ['REQUESTED', 'REVIEWING', 'OFFER_SENT', 'FAILED', 'CANCELLED', 'REFUND_REQUIRED'];

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await requireRoles(request, ['ADMIN']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const travelRequest = await prisma.travelRequest.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, role: true } },
        destination: { select: { id: true, slug: true, cityAr: true, countryAr: true } },
        template: { select: { id: true, slug: true, titleAr: true } },
        stayGuide: { select: { id: true, titleAr: true, cityAr: true, type: true } },
      },
    });

    if (!travelRequest) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'الطلب غير موجود.' } },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: travelRequest });
  } catch (error) {
    console.error('[Admin Travel Request GET] Error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'خطأ في الخادم.' } },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await requireRoles(request, ['ADMIN']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await request.json();
    const data: Record<string, unknown> = {};
    
    if (ALLOWED_STATUS.includes(body.status)) data.status = body.status;
    if (ALLOWED_PAYMENT_STATUS.includes(body.paymentStatus)) data.paymentStatus = body.paymentStatus;
    if (ALLOWED_BOOKING_STATUS.includes(body.bookingStatus)) data.bookingStatus = body.bookingStatus;
    if (typeof body.notes === 'string') data.notes = body.notes;
    if (body.details && typeof body.details === 'object') data.details = body.details;

    const travelRequest = await prisma.travelRequest.update({
      where: { id: params.id },
      data,
    });

    await writeAuditLog({
      request,
      actorId: authResult.user.userId,
      actorRole: authResult.user.role,
      action: 'TRAVEL_REQUEST_UPDATED',
      entityType: 'TRAVEL_REQUEST',
      entityId: travelRequest.id,
      details: {
        referenceNumber: travelRequest.referenceNumber,
        status: travelRequest.status,
        paymentStatus: travelRequest.paymentStatus,
        bookingStatus: travelRequest.bookingStatus,
      },
    });

    return NextResponse.json({ success: true, data: travelRequest });
  } catch (error) {
    console.error('[Admin Travel Request PATCH] Error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'خطأ في الخادم.' } },
      { status: 500 },
    );
  }
}
