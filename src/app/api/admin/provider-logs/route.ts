/**
 * Provider Logs API
 * GET /api/admin/provider-logs
 * 
 * Returns recent provider logs WITHOUT exposing secrets.
 * Requires authentication - should be protected by auth middleware.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { providerRegistry } from '@/lib/providers';

const querySchema = z.object({
  provider: z.enum(['amadeus', 'hotelbeds', 'tap', 'internal']).optional(),
  status: z.enum(['success', 'error']).optional(),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = querySchema.parse({
      provider: searchParams.get('provider'),
      status: searchParams.get('status'),
      limit: searchParams.get('limit') || '50',
    });

    const logs = providerRegistry.getLogs({
      provider: query.provider,
      status: query.status,
      limit: query.limit,
    });

    return NextResponse.json({
      data: logs,
      count: logs.length,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'بيانات غير صالحة' } },
        { status: 400 }
      );
    }
    console.error('Provider logs error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'خطأ في الخادم' } },
      { status: 500 }
    );
  }
}
