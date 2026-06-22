/**
 * Payments Refund API
 * POST /api/payments/[id]/refund
 * 
 * FAIL-CLOSED: Returns 503 if Tap keys not configured.
 * NO FAKE REFUND - Processes real refund via Tap API only.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { paymentsProvider } from '@/lib/providers';

const refundSchema = z.object({
  amount: z.number().positive().optional(),
});

export async function POST(
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

    const body = await request.json();
    const validatedInput = refundSchema.parse(body);
    const result = await paymentsProvider.refundPayment(id, validatedInput.amount);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ data: result.data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'بيانات غير صالحة', details: error.issues } },
        { status: 400 }
      );
    }
    console.error('Payment refund error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'خطأ في الخادم' } },
      { status: 500 }
    );
  }
}
