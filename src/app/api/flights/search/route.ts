/**
 * Flights Search API
 * POST /api/flights/search
 * 
 * Production endpoint - returns 503 if Amadeus not configured.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { flightsProvider } from '@/lib/providers/flights.provider';

const searchSchema = z.object({
  originLocationCode: z.string().length(3),
  destinationLocationCode: z.string().length(3),
  departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  returnDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  adults: z.number().min(1).max(9),
  children: z.number().min(0).max(9).optional(),
  infants: z.number().min(0).max(4).optional(),
  travelClass: z.enum(['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST']).optional(),
  nonStop: z.boolean().optional(),
  maxPrice: z.number().optional(),
  currencyCode: z.string().length(3).default('SAR'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedInput = searchSchema.parse(body);

    const result = await flightsProvider.search(validatedInput);

    if (!result.success) {
      const status = result.error?.code === 'SERVICE_NOT_CONFIGURED' ? 503 : 400;
      return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json({ data: result.data, count: result.data?.length || 0 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'بيانات غير صالحة', details: error.issues } },
        { status: 400 }
      );
    }
    console.error('Flights search error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'خطأ في الخادم' } },
      { status: 500 }
    );
  }
}
