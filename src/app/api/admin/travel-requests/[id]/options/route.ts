import { NextRequest, NextResponse } from 'next/server';
import { requireRoles } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeAuditLog } from '@/lib/admin-audit';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await requireRoles(request, ['ADMIN']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const options = await prisma.travelRequestOption.findMany({
      where: { requestId: params.id },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ data: options });
  } catch (error) {
    console.error('[Admin Options GET] Error:', error);
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

    // Validate required fields
    if (!body.titleAr || typeof body.titleAr !== 'string') {
      return NextResponse.json(
        { error: { code: 'INVALID_REQUEST', message: 'العنوان مطلوب.' } },
        { status: 400 },
      );
    }
    if (!body.descriptionAr || typeof body.descriptionAr !== 'string') {
      return NextResponse.json(
        { error: { code: 'INVALID_REQUEST', message: 'الوصف مطلوب.' } },
        { status: 400 },
      );
    }

    const option = await prisma.travelRequestOption.create({
      data: {
        requestId: params.id,
        titleAr: body.titleAr,
        descriptionAr: body.descriptionAr,
        optionType: body.optionType || 'SUGGESTION',
        priceHintAr: body.priceHintAr || null,
        notes: body.notes || null,
        status: 'DRAFT',
      },
    });

    await writeAuditLog({
      request,
      actorId: authResult.user.userId,
      actorRole: authResult.user.role,
      action: 'TRAVEL_REQUEST_OPTION_CREATED',
      entityType: 'TRAVEL_REQUEST_OPTION',
      entityId: option.id,
      details: {
        requestId: params.id,
        titleAr: option.titleAr,
        status: option.status,
      },
    });

    return NextResponse.json({ success: true, data: option });
  } catch (error) {
    console.error('[Admin Options POST] Error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'خطأ في الخادم.' } },
      { status: 500 },
    );
  }
}
