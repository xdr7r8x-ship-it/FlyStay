/**
 * FlyStay Payments Provider - Tap Integration
 *
 * Production integration with Tap Payments API.
 * NO CARD DATA STORED - Uses Tap Hosted Checkout only.
 * FAIL-CLOSED: Returns 503 if provider is not configured.
 * Uses TAP_SECRET_KEY, TAP_PUBLIC_KEY, TAP_WEBHOOK_SECRET, TAP_ENVIRONMENT env vars.
 */

import crypto from 'crypto';
import {
  ProviderType,
  ProviderResult,
  ProviderError,
  PaymentCreateInput,
  PaymentResult,
  PaymentStatus,
} from './provider.types';
import { providerRegistry } from './provider-registry';

export function verifyTapWebhookSignature(payload: string, signature: string, secret: string): boolean {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}

export function generateIdempotencyKey(prefix: string, reference: string): string {
  return `${prefix}_${reference}_${Date.now()}`;
}

class PaymentsProvider {
  isConfigured(): boolean {
    return !!(process.env.TAP_SECRET_KEY && process.env.TAP_PUBLIC_KEY);
  }

  private createServiceNotConfiguredError(): ProviderError {
    return {
      code: 'SERVICE_NOT_CONFIGURED',
      message: 'الدفع غير متاح حاليًا، سيتم تفعيله بعد اعتماد بوابة الدفع الرسمية.',
    };
  }

  private getBaseUrl(): string {
    const isProduction = process.env.TAP_ENVIRONMENT === 'production';
    return isProduction 
      ? 'https://api.tap.payments.com'
      : 'https://api.tap.gatewai.com';
  }

  async createPayment(input: PaymentCreateInput): Promise<ProviderResult<PaymentResult>> {
    if (!this.isConfigured()) {
      return { success: false, error: this.createServiceNotConfiguredError() };
    }

    const secretKey = process.env.TAP_SECRET_KEY;
    const publicKey = process.env.TAP_PUBLIC_KEY;

    if (!secretKey || !publicKey) {
      return { success: false, error: this.createServiceNotConfiguredError() };
    }

    try {
      const baseUrl = this.getBaseUrl();
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://flystay-ten.vercel.app';
      const idempotencyKey = generateIdempotencyKey('PAY', input.orderId);

      const payload = {
        amount: input.amount,
        currency: input.currency || 'SAR',
        customer: {
          first_name: input.customerName.split(' ')[0] || input.customerName,
          last_name: input.customerName.split(' ').slice(1).join(' ') || 'User',
          email: input.customerEmail,
          phone: {
            country_code: '966',
            number: input.customerPhone.replace(/\D/g, ''),
          },
        },
        redirect: {
          url: `${appUrl}/payment/success`,
        },
        reference: { merchant: input.orderId },
        metadata: { orderId: input.orderId, ...input.metadata },
        description: input.description || `طلب حجز #${input.orderId}`,
      };

      const response = await fetch(`${baseUrl}/v2/checkouts`, {
        method: 'POST',
        headers: {
          'Authorization': `Tap ${secretKey}`,
          'Content-Type': 'application/json',
          'idempotency-key': idempotencyKey,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.message || response.statusText;
        providerRegistry.updateHealth(ProviderType.PAYMENTS, false, errorMsg);
        return { success: false, error: { code: 'PAYMENT_CREATION_FAILED', message: errorMsg } };
      }

      const data = await response.json();
      providerRegistry.updateHealth(ProviderType.PAYMENTS, true);

      return {
        success: true,
        data: {
          id: data.id,
          providerPaymentId: data.id,
          checkoutUrl: data.url || data.redirect?.url,
          status: PaymentStatus.CREATED,
          amount: input.amount,
          currency: input.currency || 'SAR',
          createdAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      providerRegistry.updateHealth(ProviderType.PAYMENTS, false, errorMessage);
      return { success: false, error: { code: 'PROVIDER_ERROR', message: errorMessage } };
    }
  }

  async getPayment(paymentId: string): Promise<ProviderResult<PaymentResult>> {
    if (!this.isConfigured()) {
      return { success: false, error: this.createServiceNotConfiguredError() };
    }

    const secretKey = process.env.TAP_SECRET_KEY;
    if (!secretKey) {
      return { success: false, error: this.createServiceNotConfiguredError() };
    }

    try {
      const baseUrl = this.getBaseUrl();

      const response = await fetch(`${baseUrl}/v2/checkouts/${paymentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Tap ${secretKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.message || response.statusText;
        providerRegistry.updateHealth(ProviderType.PAYMENTS, false, errorMsg);
        return { success: false, error: { code: 'PAYMENT_GET_FAILED', message: errorMsg } };
      }

      const data = await response.json();
      providerRegistry.updateHealth(ProviderType.PAYMENTS, true);

      let status: PaymentStatus = PaymentStatus.PENDING;
      switch (data.status) {
        case 'CAPTURED':
        case 'PAID':
          status = PaymentStatus.PAID;
          break;
        case 'FAILED':
        case 'DECLINED':
          status = PaymentStatus.FAILED;
          break;
        case 'CANCELLED':
        case 'VOID':
          status = PaymentStatus.CANCELLED;
          break;
        case 'REFUNDED':
          status = PaymentStatus.REFUNDED;
          break;
      }

      return {
        success: true,
        data: {
          id: data.id,
          providerPaymentId: data.id,
          checkoutUrl: data.url,
          status,
          amount: parseFloat(data.amount) || 0,
          currency: data.currency || 'SAR',
          createdAt: data.created || new Date().toISOString(),
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      providerRegistry.updateHealth(ProviderType.PAYMENTS, false, errorMessage);
      return { success: false, error: { code: 'PROVIDER_ERROR', message: errorMessage } };
    }
  }

  async refundPayment(paymentId: string, amount?: number): Promise<ProviderResult<{ success: boolean; refundId: string }>> {
    if (!this.isConfigured()) {
      return { success: false, error: this.createServiceNotConfiguredError() };
    }
    return { success: false, error: { code: 'NOT_IMPLEMENTED', message: 'Refund requires payment confirmation' } };
  }

  processWebhookEvent(event: { status: string }): { status: PaymentStatus; isSuccess: boolean } {
    switch (event.status) {
      case 'CAPTURED':
      case 'PAID':
        return { status: PaymentStatus.PAID, isSuccess: true };
      case 'FAILED':
      case 'DECLINED':
        return { status: PaymentStatus.FAILED, isSuccess: false };
      case 'CANCELLED':
      case 'VOID':
        return { status: PaymentStatus.CANCELLED, isSuccess: false };
      case 'REFUNDED':
        return { status: PaymentStatus.REFUNDED, isSuccess: true };
      default:
        return { status: PaymentStatus.PENDING, isSuccess: false };
    }
  }
}

export const paymentsProvider = new PaymentsProvider();
