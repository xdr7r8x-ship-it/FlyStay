/**
 * Provider Logs API
 * GET /api/admin/provider-logs
 *
 * Returns recent provider logs WITHOUT exposing secrets.
 * Requires ADMIN role.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { providerRegistry } from '@/lib/providers';
import { requireRoles } from '@/lib/auth';

const querySchema = z.object({
  provider: z.enum(['amadeus', 'hotelbeds', 'tap', 'internal']).optional(),
  status: z.enum(['success', 'error']).optional(),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional(),
});

/**
 * Redact sensitive data from logs
 */
function redactLog(log: Record<string, unknown>): Record<string, unknown> {
  const redacted = { ...log };
  
  // List of sensitive fields to redact
  const sensitiveFields = [
    'apiKey', 'apiSecret', 'secret', 'token', 'password',
    'authorization', 'cardNumber', 'cvv', 'cvv2', 'cvc',
    'accessToken', 'refreshToken', 'bearer'
  ];
  
  for (const field of sensitiveFields) {
    if (field in redacted && typeof redacted[field] === 'string') {
      redacted[field] = '[REDACTED]';
    }
  }
  
  // Redact nested sensitive data
  if (redacted.request && typeof redacted.request === 'object') {
    (redacted as Record<string, unknown>).request = redactLog(redacted.request as Record<string, unknown>);
  }
  
  if (redacted.response && typeof redacted.response === 'object') {
    (redacted as Record<string, unknown>).response = redactLog(redacted.response as Record<string, unknown>);
  }
  
  return redacted;
}

export async function GET(request: NextRequest) {
  // RBAC: Require ADMIN role
  const authResult = await requireRoles(request, ['ADMIN']);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

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

    // Redact sensitive data before returning
    const redactedLogs = logs.map(log => redactLog(log as unknown as Record<string, unknown>));

    return NextResponse.json({
      data: redactedLogs,
      count: redactedLogs.length,
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
