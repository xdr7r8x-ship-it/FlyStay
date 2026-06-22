/**
 * Payments Get API
 * GET /api/payments/[id]
 * 
 * FAIL-CLOSED: Returns 503 if Tap keys not configured.
 * NO MOCK DATA - Gets real payment status from Tap API only.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { paymentsProvider } from '@/lib/providers';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // FAIL-CLOSED: Check provider configuration first
    if (!paymentsProvider.isConfigured()) {
      return NextResponse.json(
        { error: { code: 'SERVICE_NOT_CONFIGURED', message: 'الخدمة غير متاحة حاليًا.' } },
        { status: 503 }
      );
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'معرّف الدفع مطلوب' } },
        { status: 400 }
      );
    }

    const result = await paymentsProvider.getPayment(id);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ data: result.data });
  } catch (error) {
    console.error('Payment get error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'خطأ في الخادم' } },
      { status: 500 }
    );
  }
}
