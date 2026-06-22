/**
 * Payments Create API
 * POST /api/payments/create
 * 
 * FAIL-CLOSED: Returns 503 if Tap keys not configured.
 * NO FAKE PAYMENT - Creates real payment via Tap API only.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { paymentsProvider } from '@/lib/providers';

const createSchema = z.object({
  orderId: z.string(),
  amount: z.number().positive(),
  currency: z.string().length(3).default('SAR'),
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(8),
  description: z.string().optional(),
  metadata: z.record(z.string(), z.string()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // FAIL-CLOSED: Check provider configuration first
    if (!paymentsProvider.isConfigured()) {
      return NextResponse.json(
        { error: { code: 'SERVICE_NOT_CONFIGURED', message: 'الخدمة غير متاحة حاليًا، سيتم تفعيلها بعد اعتماد بوابة الدفع الرسمية.' } },
        { status: 503 }
      );
    }

    const body = await request.json();
    const validatedInput = createSchema.parse(body);
    const result = await paymentsProvider.createPayment(validatedInput);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Validate real provider response has id
    if (!result.data?.id) {
      return NextResponse.json(
        { error: { code: 'INVALID_PROVIDER_RESPONSE', message: 'استجابة غير صالحة من مزود الدفع' } },
        { status: 502 }
      );
    }

    return NextResponse.json({ data: result.data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'بيانات غير صالحة', details: error.issues } },
        { status: 400 }
      );
    }
    console.error('Payment create error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'خطأ في الخادم' } },
      { status: 500 }
    );
  }
}
