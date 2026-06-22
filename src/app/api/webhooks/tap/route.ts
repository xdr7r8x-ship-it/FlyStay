/**
 * Tap Webhook Handler
 * POST /api/webhooks/tap
 *
 * Production webhook endpoint with:
 * - Signature verification (before any processing)
 * - Idempotency handling
 * - WebhookEvent storage
 * - Payment status updates
 * - FAIL-CLOSED: Returns 503 if provider not configured.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { getPrisma } from '@/lib/prisma';
import { providerRegistry } from '@/lib/providers/provider-registry';

type TapEventStatus = 
  | 'CAPTURED' | 'PAID' | 'FAILED' | 'DECLINED' 
  | 'CANCELLED' | 'VOID' | 'REFUNDED' | 'PENDING'
  | 'INITIATED' | 'RESTORED' | 'TIMEDOUT' | 'UNKNOWN';

type PaymentStatusMap = 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'REFUNDED';

/**
 * Verify Tap webhook signature
 */
function verifyTapWebhookSignature(
  rawBody: string,
  signature: string,
  secret: string
): boolean {
  if (!signature || !secret) return false;
  
  try {
    // Tap uses HMAC-SHA256 signature verification
    // Signature format: t=timestamp,v1=signature
    const parts = signature.split(',');
    const timestampPart = parts.find(p => p.startsWith('t='));
    const hashPart = parts.find(p => p.startsWith('v1='));
    
    if (!timestampPart || !hashPart) return false;
    
    const timestamp = timestampPart.replace('t=', '');
    const expectedHash = hashPart.replace('v1=', '');
    
    // Create HMAC-SHA256 using Node.js crypto
    const computedHash = createHmac('sha256', secret)
      .update(timestamp + '.' + rawBody)
      .digest('base64');
    
    return computedHash === expectedHash;
  } catch {
    return false;
  }
}

/**
 * Redact sensitive data from payload
 */
function redactSensitive(obj: Record<string, unknown>): Record<string, unknown> {
  const sensitiveFields = [
    'card', 'cvv', 'cvv2', 'cvc', 'pin',
    'password', 'token', 'authorization', 'secret',
    'apiKey', 'apiSecret', 'accessToken', 'refreshToken',
    'TAP_SECRET_KEY', 'TAP_WEBHOOK_SECRET'
  ];
  
  const redacted: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (sensitiveFields.some(f => key.toLowerCase().includes(f.toLowerCase()))) {
      redacted[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      redacted[key] = redactSensitive(value as Record<string, unknown>);
    } else {
      redacted[key] = value;
    }
  }
  
  return redacted;
}

/**
 * Extract event ID from Tap webhook payload
 */
function getEventId(payload: Record<string, unknown>): string | null {
  return (payload.id as string) || null;
}

/**
 * Extract provider payment ID from Tap webhook payload
 */
function getProviderPaymentId(payload: Record<string, unknown>): string | null {
  // Tap response structure
  if (payload.id && typeof payload.id === 'string') {
    return payload.id;
  }
  return null;
}

/**
 * Extract order ID from Tap webhook payload
 */
function getOrderId(payload: Record<string, unknown>): string | null {
  // Try metadata.orderId first
  if (payload.metadata && typeof payload.metadata === 'object') {
    const metadata = payload.metadata as Record<string, unknown>;
    if (metadata.orderId && typeof metadata.orderId === 'string') {
      return metadata.orderId;
    }
  }
  
  // Try reference.merchant
  if (payload.reference && typeof payload.reference === 'object') {
    const reference = payload.reference as Record<string, unknown>;
    if (reference.merchant && typeof reference.merchant === 'string') {
      return reference.merchant;
    }
  }
  
  // Try top-level order_id
  if (payload.order_id && typeof payload.order_id === 'string') {
    return payload.order_id;
  }
  
  return null;
}

/**
 * Map Tap event status to our Payment status
 */
function getPaymentStatus(tapStatus: string | undefined): PaymentStatusMap | null {
  if (!tapStatus) return null;
  
  const status = tapStatus.toUpperCase();
  
  if (status === 'CAPTURED' || status === 'PAID') {
    return 'PAID';
  }
  if (status === 'FAILED' || status === 'DECLINED') {
    return 'FAILED';
  }
  if (status === 'CANCELLED' || status === 'VOID') {
    return 'CANCELLED';
  }
  if (status === 'REFUNDED') {
    return 'REFUNDED';
  }
  if (status === 'PENDING' || status === 'INITIATED' || status === 'TIMEDOUT' || status === 'RESTORED') {
    return 'PENDING';
  }
  
  return 'PENDING';
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('tap-signature') || '';
    
    // Check if webhook secret is configured
    const webhookSecret = providerRegistry.getWebhookSecret();
    if (!webhookSecret) {
      console.error('[Tap Webhook] TAP_WEBHOOK_SECRET not configured');
      return NextResponse.json(
        { error: { code: 'SERVICE_NOT_CONFIGURED', message: 'Webhook not configured' } },
        { status: 503 }
      );
    }

    // Verify signature BEFORE any processing
    if (!verifyTapWebhookSignature(rawBody, signature, webhookSecret)) {
      console.error('[Tap Webhook] Invalid signature');
      return NextResponse.json(
        { error: { code: 'INVALID_SIGNATURE', message: 'Invalid webhook signature' } },
        { status: 401 }
      );
    }

    // Check if database is configured
    const prisma = getPrisma();
    if (!prisma) {
      console.error('[Tap Webhook] Database not configured');
      return NextResponse.json(
        { error: { code: 'SERVICE_NOT_CONFIGURED', message: 'Service not available' } },
        { status: 503 }
      );
    }

    // Parse webhook payload
    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      console.error('[Tap Webhook] Invalid JSON payload');
      return NextResponse.json(
        { error: { code: 'INVALID_PAYLOAD', message: 'Invalid JSON payload' } },
        { status: 400 }
      );
    }

    const eventId = getEventId(payload);
    const tapStatus = payload.status as string;
    const providerPaymentId = getProviderPaymentId(payload);
    const orderId = getOrderId(payload);
    const eventType = payload.event as string || 'payment';

    // Idempotency: Check if event already processed
    if (eventId) {
      const existingEvent = await prisma.webhookEvent.findUnique({
        where: { eventId },
      });

      if (existingEvent && existingEvent.processed) {
        console.log(`[Tap Webhook] Duplicate event ${eventId}, already processed`);
        return NextResponse.json({ 
          received: true, 
          processed: false,
          reason: 'duplicate_event' 
        });
      }
    }

    // Save WebhookEvent with signature verified
    const redactedPayload = redactSensitive(payload);
    
    const webhookEvent = await prisma.webhookEvent.create({
      data: {
        providerName: 'tap',
        eventType: eventType || 'payment_status',
        eventId: eventId || `no-id-${Date.now()}`,
        signatureVerified: true,
        processed: true,
        rawPayload: redactedPayload as object,
      },
    });

    // Map Tap status to our payment status
    const paymentStatus = getPaymentStatus(tapStatus);

    if (paymentStatus && (providerPaymentId || orderId)) {
      try {
        // Find payment by providerPaymentId or orderId
        if (providerPaymentId) {
          await prisma.payment.updateMany({
            where: { providerPaymentId },
            data: { status: paymentStatus },
          });
          console.log(`[Tap Webhook] Updated payment status to ${paymentStatus}`);
        } else if (orderId) {
          await prisma.payment.updateMany({
            where: { orderId },
            data: { status: paymentStatus },
          });
          console.log(`[Tap Webhook] Updated payment status to ${paymentStatus}`);
        }
      } catch (dbError) {
        console.error('[Tap Webhook] Failed to update payment:', dbError);
        // Don't fail the webhook - event is saved
      }
    }

    // Log audit for the webhook processing
    try {
      await prisma.auditLog.create({
        data: {
          action: 'WEBHOOK_PROCESSED',
          entityType: 'WebhookEvent',
          entityId: webhookEvent.id,
          details: {
            provider: 'tap',
            eventType,
            eventId,
            paymentStatus,
            providerPaymentId,
            orderId,
          },
        },
      });
    } catch (auditError) {
      console.error('[Tap Webhook] Failed to create audit log:', auditError);
      // Don't fail the webhook
    }

    return NextResponse.json({ 
      received: true, 
      processed: true,
      eventId: webhookEvent.id 
    });

  } catch (error) {
    console.error('[Tap Webhook] Unexpected error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Webhook processing failed' } },
      { status: 500 }
    );
  }
}
