import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@/generated/prisma';
import { requireRoles } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeAuditLog } from '@/lib/admin-audit';

export async function GET(request: NextRequest) {
  const authResult = await requireRoles(request, ['ADMIN']);
  if (authResult instanceof NextResponse) return authResult;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim();
  const status = searchParams.get('status')?.trim();
  const type = searchParams.get('type')?.trim();
  const where: Prisma.StayGuideWhereInput = {};
  if (status) where.status = status;
  if (type) where.type = type;
  if (q) {
    where.OR = [
      { titleAr: { contains: q, mode: 'insensitive' } },
      { cityAr: { contains: q, mode: 'insensitive' } },
      { descriptionAr: { contains: q, mode: 'insensitive' } },
    ];
  }

  const data = await prisma.stayGuide.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    take: 200,
  });
  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const authResult = await requireRoles(request, ['ADMIN']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await request.json();
    const guide = await prisma.stayGuide.create({
      data: { ...body, status: body.status || 'DRAFT' },
    });

    await writeAuditLog({
      request,
      actorId: authResult.user.userId,
      actorRole: authResult.user.role,
      action: 'CONTENT_CREATED',
      entityType: 'STAY_GUIDE',
      entityId: guide.id,
      details: { titleAr: guide.titleAr, cityAr: guide.cityAr, status: guide.status },
    });

    return NextResponse.json({ success: true, data: guide }, { status: 201 });
  } catch (error) {
    console.error('[Admin Stay Guides POST] Error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'تعذر إنشاء دليل الإقامة.' } },
      { status: 500 },
    );
  }
}
