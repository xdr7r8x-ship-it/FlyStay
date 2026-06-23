import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { internalInventoryProvider } from '@/lib/providers';

const quoteSchema = z.object({
  inventoryItemId: z.string().min(1),
  checkin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkout: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  guests: z.number().min(1).optional(),
});

export async function POST(request: NextRequest) {
  if (!internalInventoryProvider.isConfigured()) {
    return NextResponse.json(
      { error: { code: 'SERVICE_NOT_CONFIGURED', message: 'خدمة الإقامات غير مفعلة حاليًا.' } },
      { status: 503 },
    );
  }

  try {
    const input = quoteSchema.parse(await request.json());
    const result = await internalInventoryProvider.quote({
      itemId: input.inventoryItemId,
      checkin: input.checkin,
      checkout: input.checkout,
      guests: input.guests || 1,
    });
    if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ data: result.data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'بيانات غير صالحة', details: error.issues } },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: 'خطأ في الخادم' } }, { status: 500 });
  }
}
