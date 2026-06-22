/**
 * Travel Requests API
 * POST /api/travel-requests
 * 
 * Creates a travel request from encyclopedia or manual.
 * Requires authentication.
 * Does NOT confirm booking or payment.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserFromRequest } from '@/lib/auth';

const VALID_SERVICE_TYPES = ['FLIGHT', 'HOTEL', 'PACKAGE', 'CHALET', 'RESTHOUSE', 'MIXED'];
const VALID_SOURCE_TYPES = ['ENCYCLOPEDIA', 'TEMPLATE', 'AI', 'MANUAL'];
const VALID_BUDGET_LEVELS = ['ECONOMY', 'MID', 'LUXURY', 'MIXED'];

// In-memory store for demo (when DB is unavailable)
const inMemoryRequests: Map<string, unknown> = new Map();

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const user = await getAuthUserFromRequest(request);
    if (!user?.userId) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'يلزم تسجيل الدخول.' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      sourceType = 'MANUAL',
      serviceType,
      destinationId,
      templateId,
      cityAr,
      startDate,
      endDate,
      guests,
      rooms,
      budgetLevel,
      notes,
      details = {},
    } = body;

    // Validate service type
    if (!serviceType || !VALID_SERVICE_TYPES.includes(serviceType)) {
      return NextResponse.json(
        { error: { code: 'INVALID_REQUEST', message: 'نوع الخدمة غير صالح.' } },
        { status: 400 }
      );
    }

    // Validate source type
    if (!VALID_SOURCE_TYPES.includes(sourceType)) {
      return NextResponse.json(
        { error: { code: 'INVALID_REQUEST', message: 'نوع المصدر غير صالح.' } },
        { status: 400 }
      );
    }

    const requestId = `tr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const referenceNumber = `TR-${requestId.slice(-8).toUpperCase()}`;

    // Create in-memory request for demo
    const travelRequest = {
      id: requestId,
      userId: user.userId,
      sourceType,
      serviceType,
      destinationId: destinationId || null,
      templateId: templateId || null,
      cityAr: cityAr || null,
      startDate: startDate ? new Date(startDate).toISOString() : null,
      endDate: endDate ? new Date(endDate).toISOString() : null,
      guests: guests ? parseInt(guests) : null,
      rooms: rooms ? parseInt(rooms) : null,
      budgetLevel: budgetLevel && VALID_BUDGET_LEVELS.includes(budgetLevel) ? budgetLevel : null,
      notes: notes || null,
      details,
      status: 'NEW',
      createdAt: new Date().toISOString(),
    };

    inMemoryRequests.set(requestId, travelRequest);

    console.log(`[Travel Request] Created ${referenceNumber} for user ${user.userId}`);

    return NextResponse.json({
      success: true,
      data: {
        id: travelRequest.id,
        referenceNumber,
        serviceType: travelRequest.serviceType,
        status: travelRequest.status,
        createdAt: travelRequest.createdAt,
      },
      message: 'تم إرسال طلبك للمراجعة. هذا ليس حجزًا مؤكدًا.',
    });

  } catch (error) {
    console.error('[Travel Requests] Error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'خطأ في الخادم.' } },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(request);
    if (!user?.userId) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'يلزم تسجيل الدخول.' } },
        { status: 401 }
      );
    }

    // Return empty for demo (DB not available)
    return NextResponse.json({
      data: [],
    });

  } catch (error) {
    console.error('[Travel Requests GET] Error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'خطأ في الخادم.' } },
      { status: 500 }
    );
  }
}
