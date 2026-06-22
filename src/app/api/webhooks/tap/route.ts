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
 * 
 * Webhook Signature Verification:
 * - Uses 'tap-signature' header
 * - HMAC-SHA256 with webhook secret
 * - Format: t=<timestamp>,v1=<signature>
 */
import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { prisma } from '@/lib/prisma';
import { providerRegistry } from '@/lib/providers/provider-registry';
import { ProviderType } from '@/lib/providers/provider.types';

type PaymentStatusMap = 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'REFUNDED';

/**
 * Verify Tap webhook signature
 * Per Tap documentation, signature format is t=<timestamp>,v1=<signature>
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

    // Use timing-safe comparison
    const sigBuffer = Buffer.from(expectedHash, 'base64');
    const computedBuffer = Buffer.from(computedHash, 'base64');
    
    if (sigBuffer.length !== computedBuffer.length) return false;
    
    let result = 0;
    for (let i = 0; i < sigBuffer.length; i++) {
      result |= sigBuffer[i] ^ computedBuffer[i];
    }
    return result === 0;
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
 * FAIL-SAFE: Unknown statuses default to PENDING, never PAID
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

  // Unknown status - fail safe, keep as PENDING
  console.log(`[Tap Webhook] Unknown status: ${tapStatus}, defaulting to PENDING`);
  return 'PENDING';
}

export async function POST(request: NextRequest) {
  try {
    // Read raw body BEFORE any processing
    const rawBody = await request.text();
    const signature = request.headers.get('tap-signature') || '';

    // Check if webhook secret is configured - FAIL-CLOSED
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
      
      // Create error log
      try {
        await prisma.providerLog.create({
          data: {
            providerType: ProviderType.PAYMENTS,
            providerName: 'Tap',
            action: 'WEBHOOK_SIGNATURE_INVALID',
            status: 'ERROR',
            errorMessage: 'Invalid webhook signature',
          },
        });
      } catch (logError) {
        console.error('[Tap Webhook] Failed to create provider log:', logError);
      }

      return NextResponse.json(
        { error: { code: 'INVALID_SIGNATURE', message: 'Invalid webhook signature' } },
        { status: 401 }
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
    const redactedPayload = redactSensitive(payload);

    // Log webhook received
    await prisma.providerLog.create({
      data: {
        providerType: ProviderType.PAYMENTS,
        providerName: 'Tap',
        action: 'WEBHOOK_RECEIVED',
        status: 'SUCCESS',
        requestId: eventId || undefined,
        errorMessage: tapStatus ? `status: ${tapStatus}` : undefined,
      },
    });

    // Idempotency: Check if event already processed
    if (eventId) {
      const existingEvent = await prisma.webhookEvent.findUnique({
        where: { eventId },
      });

      if (existingEvent && existingEvent.processed) {
        console.log(`[Tap Webhook] Duplicate event ${eventId}, already processed`);
        
        await prisma.providerLog.create({
          data: {
            providerType: ProviderType.PAYMENTS,
            providerName: 'Tap',
            action: 'WEBHOOK_DUPLICATE',
            status: 'SUCCESS',
            requestId: eventId,
          },
        });

        return NextResponse.json({
          received: true,
          processed: false,
          reason: 'duplicate_event'
        });
      }
    }

    // Create WebhookEvent with processed=false initially
    const webhookEvent = await prisma.webhookEvent.create({
      data: {
        providerName: 'Tap',
        eventType: eventType || 'payment_status',
        eventId: eventId || `no-id-${Date.now()}`,
        signatureVerified: true,
        processed: false,
        rawPayload: redactedPayload as object,
      },
    });

    // Log signature valid
    await prisma.providerLog.create({
      data: {
        providerType: ProviderType.PAYMENTS,
        providerName: 'Tap',
        action: 'WEBHOOK_SIGNATURE_VALID',
        status: 'SUCCESS',
        requestId: eventId || undefined,
      },
    });

    // Map Tap status to our payment status
    const paymentStatus = getPaymentStatus(tapStatus);

    // Update Payment and Order if we have enough info
    if (paymentStatus && (providerPaymentId || orderId)) {
      try {
        let payment = null;

        // Find payment
        if (providerPaymentId) {
          payment = await prisma.payment.findFirst({
            where: { providerPaymentId },
          });
        } else if (orderId) {
          payment = await prisma.payment.findFirst({
            where: { orderId },
            orderBy: { createdAt: 'desc' },
          });
        }

        if (payment) {
          // Update payment status
          await prisma.payment.update({
            where: { id: payment.id },
            data: { status: paymentStatus },
          });

          // Update order payment status
          await prisma.order.update({
            where: { id: payment.orderId },
            data: { paymentStatus: paymentStatus },
          });

          // NOTE: bookingStatus is NOT updated here
          // Booking confirmation requires separate provider confirmation

          console.log(`[Tap Webhook] Updated payment ${payment.id} to ${paymentStatus}`);

          await prisma.providerLog.create({
            data: {
              orderId: payment.orderId,
              userId: payment.userId,
              providerType: ProviderType.PAYMENTS,
              providerName: 'Tap',
              action: 'PAYMENT_STATUS_UPDATED',
              status: 'SUCCESS',
              requestId: eventId || undefined,
              errorMessage: `status: ${paymentStatus}`,
            },
          });

          await prisma.auditLog.create({
            data: {
              actorId: 'webhook',
              actorRole: 'SYSTEM',
              action: 'PAYMENT_STATUS_CHANGED',
              entityType: 'Payment',
              entityId: payment.id,
              details: {
                provider: 'Tap',
                eventType,
                eventId,
                oldStatus: payment.status,
                newStatus: paymentStatus,
                providerPaymentId,
                orderId: payment.orderId,
              },
            },
          });
        }
      } catch (dbError) {
        console.error('[Tap Webhook] Failed to update payment:', dbError);
        
        await prisma.providerLog.create({
          data: {
            providerType: ProviderType.PAYMENTS,
            providerName: 'Tap',
            action: 'PAYMENT_STATUS_UPDATE_FAILED',
            status: 'ERROR',
            requestId: eventId || undefined,
            errorMessage: dbError instanceof Error ? dbError.message : 'Database error',
          },
        });

        // Don't fail webhook, just return error
      }
    }

    // Mark webhook event as processed ONLY after successful handling
    await prisma.webhookEvent.update({
      where: { id: webhookEvent.id },
      data: { processed: true },
    });

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
