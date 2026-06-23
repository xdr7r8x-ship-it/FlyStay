import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@/generated/prisma';
import { requireRoles } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const authResult = await requireRoles(request, ['ADMIN']);
  if (authResult instanceof NextResponse) return authResult;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim();
  const status = searchParams.get('status')?.trim();
  const where: Prisma.TravelRequestWhereInput = {};
  if (status) where.status = status;
  if (q) {
    where.OR = [
      { referenceNumber: { contains: q, mode: 'insensitive' } },
      { cityAr: { contains: q, mode: 'insensitive' } },
      { notes: { contains: q, mode: 'insensitive' } },
      { user: { email: { contains: q, mode: 'insensitive' } } },
    ];
  }

  const data = await prisma.travelRequest.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: {
      user: { select: { id: true, name: true, email: true, phone: true, role: true } },
      destination: { select: { id: true, slug: true, cityAr: true, countryAr: true } },
      template: { select: { id: true, slug: true, titleAr: true } },
      stayGuide: { select: { id: true, titleAr: true, cityAr: true, type: true } },
    },
  });

  return NextResponse.json({ data });
}
