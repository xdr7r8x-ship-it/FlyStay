/**
 * Admin Destinations API
 * GET, POST /api/admin/content/destinations
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireRoles } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const authResult = await requireRoles(request, ['ADMIN']);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const destinations = await prisma.travelDestination.findMany({
      where,
      orderBy: { cityAr: 'asc' },
    });

    return NextResponse.json({ data: destinations });
  } catch (error) {
    console.error('[Admin Destinations GET] Error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'خطأ في الخادم.' } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireRoles(request, ['ADMIN']);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const body = await request.json();
    const userEmail = authResult.user?.email;
    
    const destination = await prisma.travelDestination.create({
      data: {
        ...body,
        status: body.status || 'DRAFT',
        lastReviewedAt: new Date(),
      },
    });

    // Audit log
    if (userEmail) {
      const adminUser = await prisma.user.findUnique({
        where: { email: userEmail },
        select: { id: true },
      });
      
      if (adminUser) {
        await prisma.auditLog.create({
          data: {
            actorId: adminUser.id,
            actorRole: 'ADMIN',
            action: 'CONTENT_CREATED',
            entityType: 'TRAVEL_DESTINATION',
            entityId: destination.id,
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown',
            details: { cityAr: destination.cityAr },
          },
        });
      }
    }

    return NextResponse.json({ success: true, data: destination });
  } catch (error) {
    console.error('[Admin Destinations POST] Error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'خطأ في الخادم.' } },
      { status: 500 }
    );
  }
}
