import { NextRequest, NextResponse } from 'next/server';
import { requireRoles } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeAuditLog } from '@/lib/admin-audit';
import { createUserMessage, getAllMessages } from '@/lib/travel-request-messages';
import { notifyUserNewMessage } from '@/lib/notifications';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await requireRoles(request, ['ADMIN']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const messages = await getAllMessages(params.id);
    return NextResponse.json({ data: messages });
  } catch (error) {
    console.error('[Admin Messages GET] Error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'خطأ في الخادم.' } },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await requireRoles(request, ['ADMIN']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await request.json();

    if (!body.bodyAr || typeof body.bodyAr !== 'string' || body.bodyAr.trim().length === 0) {
      return NextResponse.json(
        { error: { code: 'INVALID_REQUEST', message: 'نص الرسالة مطلوب.' } },
        { status: 400 },
      );
    }

    const travelRequest = await prisma.travelRequest.findUnique({
      where: { id: params.id },
      select: { userId: true },
    });

    if (!travelRequest) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'الطلب غير موجود.' } },
        { status: 404 },
      );
    }

    const visibility = body.visibility === 'INTERNAL' ? 'INTERNAL' : 'USER';

    const message = await createUserMessage(
      params.id,
      authResult.user.userId,
      'ADMIN',
      body.bodyAr.trim(),
      visibility
    );

    if (visibility === 'USER') {
      await notifyUserNewMessage(travelRequest.userId);
    }

    await writeAuditLog({
      request,
      actorId: authResult.user.userId,
      actorRole: authResult.user.role,
      action: 'TRAVEL_REQUEST_MESSAGE_CREATED',
      entityType: 'TRAVEL_REQUEST_MESSAGE',
      entityId: message.id,
      details: {
        requestId: params.id,
        visibility,
        messageType: message.messageType,
      },
    });

    return NextResponse.json({ success: true, data: message });
  } catch (error) {
    console.error('[Admin Messages POST] Error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'خطأ في الخادم.' } },
      { status: 500 },
    );
  }
}
