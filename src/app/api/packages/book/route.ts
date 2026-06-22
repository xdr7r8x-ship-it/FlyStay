/**
 * Packages Book API
 * POST /api/packages/book
 * 
 * FAIL-CLOSED: Returns 503 if Packages provider not configured.
 * NO FAKE BOOKING - Creates real booking via Packages provider only.
 * Requires bookingId and confirmationCode from real provider response.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { packagesProvider } from '@/lib/providers';

const bookSchema = z.object({
  packageId: z.string(),
  travelers: z.array(z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    email: z.string().email(),
    phone: z.string().min(8),
  })).min(1),
  leadGuest: z.object({
    email: z.string().email(),
    phone: z.string().min(8),
  }),
});

export async function POST(request: NextRequest) {
  try {
    // FAIL-CLOSED: Check provider configuration first
    if (!packagesProvider.isConfigured()) {
      return NextResponse.json(
        { error: { code: 'SERVICE_NOT_CONFIGURED', message: 'الخدمة غير متاحة حاليًا، سيتم تفعيلها بعد اعتماد مزود الحجز الرسمي.' } },
        { status: 503 }
      );
    }

    const body = await request.json();
    const validatedInput = bookSchema.parse(body);
    const result = await packagesProvider.createBooking();

    if (!result.success) {
      const status = result.error?.code === 'NOT_IMPLEMENTED' ? 501 : 400;
      return NextResponse.json({ error: result.error }, { status });
    }

    // Validate real provider response
    if (!result.data?.bookingId || !result.data?.confirmationCode) {
      return NextResponse.json(
        { error: { code: 'INVALID_PROVIDER_RESPONSE', message: 'استجابة غير صالحة من مزود الخدمة' } },
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
    console.error('Packages book error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'خطأ في الخادم' } },
      { status: 500 }
    );
  }
}
