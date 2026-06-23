import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const VALID_SERVICE_TYPES = ['FLIGHT', 'HOTEL', 'PACKAGE', 'CHALET', 'RESTHOUSE', 'MIXED'];
const VALID_SOURCE_TYPES = ['AI', 'ENCYCLOPEDIA', 'TEMPLATE', 'MANUAL', 'DISCOVERY'];
const VALID_BUDGET_LEVELS = ['ECONOMY', 'MID', 'LUXURY', 'MIXED'];
const VALID_STATUSES = ['NEW', 'REVIEWING'];

function unauthorized() {
  return NextResponse.json(
    { error: { code: 'UNAUTHORIZED', message: 'يلزم تسجيل الدخول.' } },
    { status: 401 },
  );
}

function requestReference() {
  const timePart = Date.now().toString(36).toUpperCase();
  const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `TR-${timePart}-${randomPart}`;
}

function toDate(value: unknown) {
  if (!value || typeof value !== 'string') return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export async function POST(request: NextRequest) {
  const user = await getAuthUserFromRequest(request);
  if (!user?.userId) return unauthorized();

  try {
    const body = await request.json();
    const serviceType = String(body.serviceType || '');
    const sourceType = String(body.sourceType || 'MANUAL');

    if (!VALID_SERVICE_TYPES.includes(serviceType)) {
      return NextResponse.json(
        { error: { code: 'INVALID_REQUEST', message: 'نوع الخدمة غير صالح.' } },
        { status: 400 },
      );
    }

    if (!VALID_SOURCE_TYPES.includes(sourceType)) {
      return NextResponse.json(
        { error: { code: 'INVALID_REQUEST', message: 'نوع المصدر غير صالح.' } },
        { status: 400 },
      );
    }

    const status = VALID_STATUSES.includes(body.status) ? body.status : 'NEW';
    const budgetLevel = VALID_BUDGET_LEVELS.includes(body.budgetLevel) ? body.budgetLevel : null;

    const travelRequest = await prisma.travelRequest.create({
      data: {
        referenceNumber: requestReference(),
        userId: user.userId,
        sourceType,
        serviceType,
        destinationId: body.destinationId || null,
        templateId: body.templateId || null,
        stayGuideId: body.stayGuideId || null,
        cityAr: body.cityAr || null,
        startDate: toDate(body.startDate),
        endDate: toDate(body.endDate),
        guests: body.guests ? Number(body.guests) : null,
        rooms: body.rooms ? Number(body.rooms) : null,
        budgetLevel,
        notes: body.notes || null,
        details: body.details && typeof body.details === 'object' ? body.details : {},
        status,
        paymentStatus: 'CREATED',
        bookingStatus: 'REQUESTED',
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: user.userId,
        actorRole: user.role,
        action: 'TRAVEL_REQUEST_CREATED',
        entityType: 'TRAVEL_REQUEST',
        entityId: travelRequest.id,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        details: {
          referenceNumber: travelRequest.referenceNumber,
          serviceType: travelRequest.serviceType,
          sourceType: travelRequest.sourceType,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        requestId: travelRequest.id,
        referenceNumber: travelRequest.referenceNumber,
        status: travelRequest.status,
        paymentStatus: travelRequest.paymentStatus,
        bookingStatus: travelRequest.bookingStatus,
      },
      message: 'تم إرسال طلبك للمراجعة. هذا ليس حجزًا مؤكدًا.',
    });
  } catch (error) {
    console.error('[Travel Requests POST] Error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'خطأ في الخادم.' } },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  const user = await getAuthUserFromRequest(request);
  if (!user?.userId) return unauthorized();

  try {
    const requests = await prisma.travelRequest.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: 'desc' },
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

    return NextResponse.json({ data: requests });
  } catch (error) {
    console.error('[Travel Requests GET] Error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'خطأ في الخادم.' } },
      { status: 500 },
    );
  }
}
