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
  const serviceType = searchParams.get('serviceType')?.trim();
  const where: Prisma.TripTemplateWhereInput = {};
  if (status) where.status = status;
  if (serviceType) where.serviceType = serviceType;
  if (q) {
    where.OR = [
      { titleAr: { contains: q, mode: 'insensitive' } },
      { summaryAr: { contains: q, mode: 'insensitive' } },
      { cityAr: { contains: q, mode: 'insensitive' } },
      { slug: { contains: q, mode: 'insensitive' } },
    ];
  }

  const data = await prisma.tripTemplate.findMany({
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
    const template = await prisma.tripTemplate.create({
      data: { ...body, status: body.status || 'DRAFT' },
    });

    await writeAuditLog({
      request,
      actorId: authResult.user.userId,
      actorRole: authResult.user.role,
      action: 'CONTENT_CREATED',
      entityType: 'TRIP_TEMPLATE',
      entityId: template.id,
      details: { slug: template.slug, titleAr: template.titleAr, status: template.status },
    });

    return NextResponse.json({ success: true, data: template }, { status: 201 });
  } catch (error) {
    console.error('[Admin Templates POST] Error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'تعذر إنشاء قالب الرحلة.' } },
      { status: 500 },
    );
  }
}
