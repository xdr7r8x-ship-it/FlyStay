/**
 * Chalets Book API
 * POST /api/chalets/book
 * 
 * FAIL-CLOSED: Returns 503 if internal inventory not enabled.
 * NO FAKE BOOKING - Creates real booking in database.
 * Requires providerBookingId and confirmationCode from real provider response.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { internalInventoryProvider } from '@/lib/providers';

const bookSchema = z.object({
  itemId: z.string(),
  checkin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkout: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  guests: z.number().min(1),
  leadGuest: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(8),
  }),
});

export async function POST(request: NextRequest) {
  try {
    // FAIL-CLOSED: Check provider configuration first
    if (!internalInventoryProvider.isConfigured()) {
      return NextResponse.json(
        { error: { code: 'SERVICE_NOT_CONFIGURED', message: 'الخدمة غير متاحة حاليًا.' } },
        { status: 503 }
      );
    }

    const body = await request.json();
    const validatedInput = bookSchema.parse(body);

    // First get a quote, then create booking
    const quoteResult = await internalInventoryProvider.quote({
      itemId: validatedInput.itemId,
      checkin: validatedInput.checkin,
      checkout: validatedInput.checkout,
      guests: validatedInput.guests,
    });

    if (!quoteResult.success || !quoteResult.data) {
      return NextResponse.json({ error: quoteResult.error }, { status: 400 });
    }

    const result = await internalInventoryProvider.createBooking({
      quoteId: quoteResult.data.quoteId,
      guestName: validatedInput.leadGuest.name,
      guestEmail: validatedInput.leadGuest.email,
      guestPhone: validatedInput.leadGuest.phone,
      checkin: validatedInput.checkin,
      checkout: validatedInput.checkout,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
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
    console.error('Chalets book error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'خطأ في الخادم' } },
      { status: 500 }
    );
  }
}
