import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createUserMessage, getUserMessages } from '@/lib/travel-request-messages';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUserFromRequest(request);
  if (!user?.userId) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'يلزم تسجيل الدخول.' } },
      { status: 401 },
    );
  }

  try {
    const travelRequest = await prisma.travelRequest.findUnique({
      where: { id: params.id },
    });

    if (!travelRequest) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'الطلب غير موجود.' } },
        { status: 404 },
      );
    }

    if (travelRequest.userId !== user.userId) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'غير مصرح لك بعرض هذا الطلب.' } },
        { status: 403 },
      );
    }

    const messages = await getUserMessages(params.id);
    return NextResponse.json({ data: messages });
  } catch (error) {
    console.error('[User Messages GET] Error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'خطأ في الخادم.' } },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUserFromRequest(request);
  if (!user?.userId) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'يلزم تسجيل الدخول.' } },
      { status: 401 },
    );
  }

  try {
    const travelRequest = await prisma.travelRequest.findUnique({
      where: { id: params.id },
    });

    if (!travelRequest) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'الطلب غير موجود.' } },
        { status: 404 },
      );
    }

    if (travelRequest.userId !== user.userId) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'غير مصرح لك بإرسال رسائل.' } },
        { status: 403 },
      );
    }

    const body = await request.json();

    if (!body.bodyAr || typeof body.bodyAr !== 'string' || body.bodyAr.trim().length === 0) {
      return NextResponse.json(
        { error: { code: 'INVALID_REQUEST', message: 'نص الرسالة مطلوب.' } },
        { status: 400 },
      );
    }

    const message = await createUserMessage(
      params.id,
      user.userId,
      'USER',
      body.bodyAr.trim(),
      'USER'
    );

    return NextResponse.json({ success: true, data: message });
  } catch (error) {
    console.error('[User Messages POST] Error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'خطأ في الخادم.' } },
      { status: 500 },
    );
  }
}
