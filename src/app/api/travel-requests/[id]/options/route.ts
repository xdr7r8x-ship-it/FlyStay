import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function unauthorized() {
  return NextResponse.json(
    { error: { code: 'UNAUTHORIZED', message: 'يلزم تسجيل الدخول.' } },
    { status: 401 },
  );
}

function forbidden() {
  return NextResponse.json(
    { error: { code: 'FORBIDDEN', message: 'غير مصرح لك بعرض هذا الطلب.' } },
    { status: 403 },
  );
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUserFromRequest(request);
  if (!user?.userId) return unauthorized();

  try {
    // Get the request first to verify ownership
    const travelRequest = await prisma.travelRequest.findUnique({
      where: { id: params.id },
    });

    if (!travelRequest) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'الطلب غير موجود.' } },
        { status: 404 },
      );
    }

    // User can only see their own request's options
    if (travelRequest.userId !== user.userId) {
      return forbidden();
    }

    // Only return SENT or SELECTED options - no DRAFT, no ARCHIVED, no internal notes
    const options = await prisma.travelRequestOption.findMany({
      where: {
        requestId: params.id,
        status: { in: ['SENT', 'SELECTED'] },
      },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        requestId: true,
        titleAr: true,
        descriptionAr: true,
        optionType: true,
        priceHintAr: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        // NO notes field - it's internal
      },
    });

    return NextResponse.json({ data: options });
  } catch (error) {
    console.error('[User Options GET] Error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'خطأ في الخادم.' } },
      { status: 500 },
    );
  }
}
