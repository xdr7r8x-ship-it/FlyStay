/**
 * AI Travel Request API
 * POST /api/ai/travel-request
 * 
 * Creates a draft travel request from AI conversation.
 * Requires authentication.
 * Does NOT confirm booking or payment.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserFromRequest } from '@/lib/auth';

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
      serviceType,      // 'flight' | 'hotel' | 'package' | 'chalet'
      details,          // Object with service-specific details
      notes             // Optional notes from user
    } = body;

    // Validate service type
    const validTypes = ['flight', 'hotel', 'package', 'chalet'];
    if (!serviceType || !validTypes.includes(serviceType)) {
      return NextResponse.json(
        { error: { code: 'INVALID_REQUEST', message: 'نوع الخدمة غير صالح.' } },
        { status: 400 }
      );
    }

    // Validate details object
    if (!details || typeof details !== 'object') {
      return NextResponse.json(
        { error: { code: 'INVALID_REQUEST', message: 'تفاصيل الطلب مطلوبة.' } },
        { status: 400 }
      );
    }

    // Build service type label in Arabic
    const serviceLabels: Record<string, string> = {
      flight: 'رحلة طيران',
      hotel: 'فندق',
      package: 'باقة سفر',
      chalet: 'شاليه',
    };

    // Create a unique reference number
    const referenceNumber = `TR-${Date.now().toString(36).toUpperCase()}`;

    // Build response (draft request only)
    const draftRequest = {
      referenceNumber,
      serviceType,
      serviceLabel: serviceLabels[serviceType],
      userId: user.userId,
      status: 'PENDING_REVIEW',
      details,
      notes: notes || null,
      createdAt: new Date().toISOString(),
      message: 'تم استلام طلبك للمراجعة. هذا ليس حجزًا مؤكدًا.',
    };

    console.log(`[AI Travel Request] Created draft ${referenceNumber} for user ${user.userId}`);

    return NextResponse.json({
      success: true,
      data: draftRequest,
      message: 'تم تجهيز طلبك للمراجعة. ما يعني هذا حجزًا مؤكدًا.',
    });

  } catch (error) {
    console.error('[AI Travel Request] Error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'خطأ في الخادم.' } },
      { status: 500 }
    );
  }
}
