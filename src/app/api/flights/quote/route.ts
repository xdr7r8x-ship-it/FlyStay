/**
 * Flights Quote API
 * POST /api/flights/quote
 * 
 * FAIL-CLOSED: Returns 503 if Amadeus keys not configured.
 * NO MOCK DATA - Returns real quote from Amadeus API only.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { flightsProvider } from '@/lib/providers';

const quoteSchema = z.object({
  offerIds: z.array(z.string()).min(1),
});

export async function POST(request: NextRequest) {
  try {
    // FAIL-CLOSED: Check provider configuration first
    if (!flightsProvider.isConfigured()) {
      return NextResponse.json(
        { error: { code: 'SERVICE_NOT_CONFIGURED', message: 'الخدمة غير متاحة حاليًا، سيتم تفعيلها بعد اعتماد مزود الحجز الرسمي.' } },
        { status: 503 }
      );
    }

    const body = await request.json();
    const validatedInput = quoteSchema.parse(body);
    const result = await flightsProvider.quote(validatedInput.offerIds);

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
    console.error('Flights quote error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'خطأ في الخادم' } },
      { status: 500 }
    );
  }
}
