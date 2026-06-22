/**
 * Provider Logs API
 * GET /api/admin/provider-logs
 *
 * Returns recent provider logs WITHOUT exposing secrets.
 * Requires ADMIN role.
 */
import { NextRequest, NextResponse } from 'next/server';
import { providerRegistry, ProviderType } from '@/lib/providers';
import { requireRoles } from '@/lib/auth';

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

// Map string provider names to ProviderType enum
function mapProviderName(name: string | null): ProviderType | undefined {
  if (!name) return undefined;
  const mapping: Record<string, ProviderType> = {
    'amadeus': ProviderType.FLIGHTS,
    'flights': ProviderType.FLIGHTS,
    'hotelbeds': ProviderType.HOTELS,
    'hotels': ProviderType.HOTELS,
    'tap': ProviderType.PAYMENTS,
    'payments': ProviderType.PAYMENTS,
    'packages': ProviderType.PACKAGES,
    'internal': ProviderType.INTERNAL,
    'chalets': ProviderType.CHALETS,
    'resthouses': ProviderType.RESTHOUSES,
  };
  return mapping[name.toLowerCase()];
}

export async function GET(request: NextRequest) {
  // RBAC: Require ADMIN role
  const authResult = await requireRoles(request, ['ADMIN']);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query params with defaults
    const provider = searchParams.get('provider');
    const status = searchParams.get('status');
    const limitStr = searchParams.get('limit');
    const limit = limitStr ? parseInt(limitStr, 10) : 50;

    // Validate limit
    if (isNaN(limit) || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'الحد يجب أن يكون بين 1 و 100' } },
        { status: 400 }
      );
    }

    // Map provider name to enum
    const providerType = mapProviderName(provider);

    // Validate provider if provided
    if (provider && !providerType) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'مزود غير صالح' } },
        { status: 400 }
      );
    }

    // Validate status if provided
    if (status && !['success', 'error'].includes(status.toLowerCase())) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'حالة غير صالحة' } },
        { status: 400 }
      );
    }

    const logs = providerRegistry.getLogs({
      provider: providerType,
      status: status || undefined,
      limit: limit,
    });

    // Redact sensitive data before returning
    const redactedLogs = logs.map(log => redactLog(log as unknown as Record<string, unknown>));

    return NextResponse.json({
      data: redactedLogs,
      count: redactedLogs.length,
    });
  } catch (error) {
    console.error('Provider logs error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'خطأ في الخادم' } },
      { status: 500 }
    );
  }
}
