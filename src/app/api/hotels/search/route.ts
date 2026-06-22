/**
 * Hotels Search API
 * POST /api/hotels/search
 * 
 * FAIL-CLOSED: Returns 503 if Hotelbeds keys not configured.
 * NO MOCK DATA - Returns real results from Hotelbeds API only.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { hotelsProvider } from '@/lib/providers';

const searchSchema = z.object({
  destination: z.string().min(1),
  checkin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkout: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  rooms: z.number().min(1).max(9),
  adults: z.number().min(1).max(9),
  children: z.number().min(0).max(9).optional(),
  nationality: z.string().length(2).optional(),
  currency: z.string().length(3).default('SAR'),
  maxPrice: z.number().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // FAIL-CLOSED: Check provider configuration first
    if (!hotelsProvider.isConfigured()) {
      return NextResponse.json(
        { error: { code: 'SERVICE_NOT_CONFIGURED', message: 'الخدمة غير متاحة حاليًا، سيتم تفعيلها بعد اعتماد مزود الحجز الرسمي.' } },
        { status: 503 }
      );
    }

    const body = await request.json();
    const validatedInput = searchSchema.parse(body);
    const result = await hotelsProvider.search(validatedInput);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ data: result.data, count: result.data?.length || 0 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'بيانات غير صالحة', details: error.issues } },
        { status: 400 }
      );
    }
    console.error('Hotels search error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'خطأ في الخادم' } },
      { status: 500 }
    );
  }
}
