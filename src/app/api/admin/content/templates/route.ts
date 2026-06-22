/**
 * Admin Templates API
 * GET, POST /api/admin/content/templates
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
    const templates = await prisma.tripTemplate.findMany({
      orderBy: { titleAr: 'asc' },
    });

    return NextResponse.json({ data: templates });
  } catch (error) {
    console.error('[Admin Templates GET] Error:', error);
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

    const template = await prisma.tripTemplate.create({
      data: {
        ...body,
        status: body.status || 'DRAFT',
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
            entityType: 'TRIP_TEMPLATE',
            entityId: template.id,
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown',
            details: { titleAr: template.titleAr },
          },
        });
      }
    }

    return NextResponse.json({ success: true, data: template });
  } catch (error) {
    console.error('[Admin Templates POST] Error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'خطأ في الخادم.' } },
      { status: 500 }
    );
  }
}
