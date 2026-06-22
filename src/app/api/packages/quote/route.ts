/**
 * Packages Quote API
 * POST /api/packages/quote
 * 
 * FAIL-CLOSED: Returns 503 if Packages provider not configured.
 * NO MOCK DATA - Returns real quote from Packages provider only.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { packagesProvider } from '@/lib/providers';

const quoteSchema = z.object({
  packageId: z.string(),
  travelers: z.number().min(1),
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
    const validatedInput = quoteSchema.parse(body);
    const result = await packagesProvider.quote();

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
    console.error('Packages quote error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'خطأ في الخادم' } },
      { status: 500 }
    );
  }
}
