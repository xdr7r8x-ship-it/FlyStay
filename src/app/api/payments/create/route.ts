/**
 * Payments Create API
 * POST /api/payments/create
 *
 * FAIL-CLOSED: Returns 503 if Tap keys not configured.
 * Requires authentication.
 * Amount/currency come from DB only.
 * NO FAKE PAYMENT - Creates real payment via Tap API only.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { paymentsProvider } from '@/lib/providers';
import { getAuthUserFromRequest } from '@/lib/auth';
import { ProviderType } from '@/lib/providers/provider.types';

const createSchema = z.object({
  orderId: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const authUser = await getAuthUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'غير مصرح بالوصول' } },
        { status: 401 }
      );
    }

    // FAIL-CLOSED: Check provider configuration first
    if (!paymentsProvider.isConfigured()) {
      return NextResponse.json(
        { error: { code: 'SERVICE_NOT_CONFIGURED', message: 'الخدمة غير متاحة حاليًا، سيتم تفعيلها بعد اعتماد بوابة الدفع الرسمية.' } },
        { status: 503 }
      );
    }

    const body = await request.json();
    const validatedInput = createSchema.parse(body);
    const { orderId } = validatedInput;

    // Get order from DB - ADMIN can access any order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'الطلب غير موجود' } },
        { status: 404 }
      );
    }

    // Check ownership - ADMIN can access any order
    if (order.userId !== authUser.userId && authUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'غير مصرح بالوصول لهذا الطلب' } },
        { status: 403 }
      );
    }

    // Check if order already paid
    if (order.paymentStatus === 'PAID') {
      return NextResponse.json(
        { error: { code: 'ALREADY_PAID', message: 'تم الدفع لهذا الطلب مسبقًا' } },
        { status: 409 }
      );
    }

    // Get amount and currency from DB only
    const amount = order.finalAmount;
    const currency = order.currency || 'SAR';

    if (!amount || amount.lte(0)) {
      return NextResponse.json(
        { error: { code: 'INVALID_AMOUNT', message: 'المبلغ غير صالح للدفع' } },
        { status: 400 }
      );
    }

    // Check for existing pending payment (idempotency)
    const existingPayment = await prisma.payment.findFirst({
      where: {
        orderId: orderId,
        status: { in: ['PENDING', 'CREATED'] },
      },
    });

    if (existingPayment) {
      // Return existing checkout URL
      return NextResponse.json({
        data: {
          id: existingPayment.id,
          providerPaymentId: existingPayment.providerPaymentId,
          checkoutUrl: existingPayment.checkoutUrl,
          status: existingPayment.status,
          amount: existingPayment.amount,
          currency: existingPayment.currency,
        },
      });
    }

    // Create Tap payment
    const result = await paymentsProvider.createPayment({
      orderId: orderId,
      amount: parseFloat(amount.toString()),
      currency: currency,
      customerName: order.user.name,
      customerEmail: order.user.email,
      customerPhone: order.user.phone || '+966500000000',
      description: `طلب حجز #${order.orderNumber}`,
    });

    if (!result.success) {
      // Log provider error
      await prisma.providerLog.create({
        data: {
          userId: authUser.userId,
          orderId: orderId,
          providerType: ProviderType.PAYMENTS,
          providerName: 'Tap',
          action: 'CREATE_PAYMENT_FAILED',
          status: 'ERROR',
          errorCode: result.error?.code,
          errorMessage: result.error?.message,
        },
      });

      return NextResponse.json({ error: result.error }, { status: 502 });
    }

    // Create payment record in DB
    const payment = await prisma.payment.create({
      data: {
        orderId: orderId,
        userId: order.userId,
        providerName: 'Tap',
        providerPaymentId: result.data?.providerPaymentId || null,
        checkoutUrl: result.data?.checkoutUrl || null,
        amount: amount,
        currency: currency,
        status: 'PENDING',
        idempotencyKey: `PAY_${orderId}_${Date.now()}`,
        rawProviderResponse: {
          providerResponseId: result.data?.id,
          createdAt: result.data?.createdAt,
        } as object,
      },
    });

    // Update order payment status to PENDING
    await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: 'PENDING' },
    });

    // Create provider log
    await prisma.providerLog.create({
      data: {
        userId: authUser.userId,
        orderId: orderId,
        providerType: ProviderType.PAYMENTS,
        providerName: 'Tap',
        action: 'CREATE_PAYMENT_SUCCESS',
        status: 'SUCCESS',
        idempotencyKey: payment.idempotencyKey,
        requestId: result.data?.id,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        actorId: authUser.userId,
        actorRole: authUser.role,
        action: 'PAYMENT_CREATED',
        entityType: 'Payment',
        entityId: payment.id,
        details: {
          orderId: orderId,
          amount: parseFloat(amount.toString()),
          currency: currency,
          provider: 'Tap',
        },
      },
    });

    return NextResponse.json({
      data: {
        id: payment.id,
        providerPaymentId: payment.providerPaymentId,
        checkoutUrl: payment.checkoutUrl,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'بيانات غير صالحة', details: error.issues } },
        { status: 400 }
      );
    }
    console.error('Payment create error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'خطأ في الخادم' } },
      { status: 500 }
    );
  }
}
