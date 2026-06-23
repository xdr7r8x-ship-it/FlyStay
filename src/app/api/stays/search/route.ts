import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { internalInventoryProvider } from '@/lib/providers';

const searchSchema = z.object({
  city: z.string().optional(),
  serviceType: z.enum(['CHALET', 'RESTHOUSE']).default('CHALET'),
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
    const input = searchSchema.parse(await request.json());
    const result = await internalInventoryProvider.search(input);
    if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ data: result.data, count: result.data?.length || 0 });
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
