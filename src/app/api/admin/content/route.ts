/**
 * Admin Content Management API
 * GET /api/admin/content
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireRoles } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  // RBAC: Require ADMIN role
  const authResult = await requireRoles(request, ['ADMIN']);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const [destinations, templates, stayGuides, areas, activities] = await Promise.all([
      prisma.travelDestination.findMany({
        where: { status: { not: 'INACTIVE' } },
        select: {
          id: true,
          slug: true,
          cityAr: true,
          countryAr: true,
          status: true,
          sourceType: true,
          lastReviewedAt: true,
          updatedAt: true,
        },
        orderBy: { cityAr: 'asc' },
      }),
      prisma.tripTemplate.findMany({
        where: { status: { not: 'INACTIVE' } },
        select: {
          id: true,
          slug: true,
          titleAr: true,
          serviceType: true,
          cityAr: true,
          budgetLevel: true,
          status: true,
          updatedAt: true,
        },
        orderBy: { titleAr: 'asc' },
      }),
      prisma.stayGuide.findMany({
        where: { status: { not: 'INACTIVE' } },
        select: {
          id: true,
          type: true,
          cityAr: true,
          titleAr: true,
          budgetLevel: true,
          status: true,
          updatedAt: true,
        },
        orderBy: { titleAr: 'asc' },
      }),
      prisma.travelArea.findMany({
        where: { status: 'ACTIVE' },
        select: {
          id: true,
          nameAr: true,
          destinationId: true,
        },
        take: 50,
        orderBy: { nameAr: 'asc' },
      }),
      prisma.travelActivity.findMany({
        where: { status: 'ACTIVE' },
        select: {
          id: true,
          titleAr: true,
          category: true,
          destinationId: true,
        },
        take: 50,
        orderBy: { titleAr: 'asc' },
      }),
    ]);

    return NextResponse.json({
      destinations,
      templates,
      stayGuides,
      areas,
      activities,
      counts: {
        destinations: destinations.length,
        templates: templates.length,
        stayGuides: stayGuides.length,
      },
    });

  } catch (error) {
    console.error('[Admin Content] Error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'خطأ في الخادم.' } },
      { status: 500 }
    );
  }
}
