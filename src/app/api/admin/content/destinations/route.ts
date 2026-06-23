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
  const country = searchParams.get('country')?.trim();
  const where: Prisma.TravelDestinationWhereInput = {};
  if (status) where.status = status;
  if (country) where.countryAr = { contains: country, mode: 'insensitive' };
  if (q) {
    where.OR = [
      { cityAr: { contains: q, mode: 'insensitive' } },
      { cityEn: { contains: q, mode: 'insensitive' } },
      { countryAr: { contains: q, mode: 'insensitive' } },
      { slug: { contains: q, mode: 'insensitive' } },
    ];
  }

  const data = await prisma.travelDestination.findMany({
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
    const destination = await prisma.travelDestination.create({
      data: {
        ...body,
        status: body.status || 'DRAFT',
        sourceType: 'ADMIN',
        lastReviewedAt: new Date(),
      },
    });

    await writeAuditLog({
      request,
      actorId: authResult.user.userId,
      actorRole: authResult.user.role,
      action: 'CONTENT_CREATED',
      entityType: 'TRAVEL_DESTINATION',
      entityId: destination.id,
      details: { slug: destination.slug, cityAr: destination.cityAr, status: destination.status },
    });

    return NextResponse.json({ success: true, data: destination }, { status: 201 });
  } catch (error) {
    console.error('[Admin Destinations POST] Error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'تعذر إنشاء الوجهة.' } },
      { status: 500 },
    );
  }
}
