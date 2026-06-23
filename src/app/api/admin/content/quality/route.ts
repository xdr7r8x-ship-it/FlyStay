import { NextRequest, NextResponse } from 'next/server';
import { requireRoles } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeAuditLog } from '@/lib/admin-audit';

// Forbidden phrases that indicate fake/conflict content
const FORBIDDEN_PHRASES = [
  'احجز الآن',
  'تم الحجز',
  'حجز مؤكد',
  'متوفر الآن',
  'السعر النهائي',
  'confirmed booking',
  'guaranteed booking',
  'book now',
  'final price',
];

// Test-related patterns
const TEST_PATTERNS = [
  /^test[-_]/i,
  /test$/i,
  /test\s/i,
];

interface QualityIssue {
  id: string;
  entityType: string;
  entityName: string;
  issueType: string;
  issueDetails: string;
  severity: 'critical' | 'warning' | 'info';
}

export async function GET(request: NextRequest) {
  const authResult = await requireRoles(request, ['ADMIN']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const issues: QualityIssue[] = [];

    // Check destinations
    const destinations = await prisma.travelDestination.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        slug: true,
        cityAr: true,
        shortSummaryAr: true,
        descriptionAr: true,
        travelStyles: true,
        bestForAr: true,
      },
    });

    for (const dest of destinations) {
      // Check test patterns
      if (TEST_PATTERNS.some(pattern => pattern.test(dest.slug))) {
        issues.push({
          id: dest.id,
          entityType: 'DESTINATION',
          entityName: dest.cityAr || dest.slug,
          issueType: 'TEST_SLUG',
          issueDetails: `Slug contains test pattern: ${dest.slug}`,
          severity: 'critical',
        });
      }

      if (TEST_PATTERNS.some(pattern => pattern.test(dest.cityAr || ''))) {
        issues.push({
          id: dest.id,
          entityType: 'DESTINATION',
          entityName: dest.cityAr || dest.slug,
          issueType: 'TEST_NAME',
          issueDetails: 'Name contains test pattern',
          severity: 'critical',
        });
      }

      // Check missing required fields
      if (!dest.shortSummaryAr || dest.shortSummaryAr.length < 10) {
        issues.push({
          id: dest.id,
          entityType: 'DESTINATION',
          entityName: dest.cityAr || dest.slug,
          issueType: 'MISSING_SUMMARY',
          issueDetails: 'shortSummaryAr is missing or too short',
          severity: 'warning',
        });
      }

      // Check travelStyles (Json field)
      const travelStyles = Array.isArray(dest.travelStyles) ? dest.travelStyles : [];
      if (travelStyles.length === 0) {
        issues.push({
          id: dest.id,
          entityType: 'DESTINATION',
          entityName: dest.cityAr || dest.slug,
          issueType: 'MISSING_TRAVEL_STYLES',
          issueDetails: 'travelStyles is empty',
          severity: 'warning',
        });
      }

      // Check bestForAr (Json field)
      const bestForAr = Array.isArray(dest.bestForAr) ? dest.bestForAr : [];
      if (bestForAr.length === 0) {
        issues.push({
          id: dest.id,
          entityType: 'DESTINATION',
          entityName: dest.cityAr || dest.slug,
          issueType: 'MISSING_BEST_FOR',
          issueDetails: 'bestForAr is empty',
          severity: 'info',
        });
      }

      // Check forbidden phrases in text fields
      const textFields = [dest.shortSummaryAr, dest.descriptionAr].filter(Boolean);
      for (const text of textFields) {
        for (const phrase of FORBIDDEN_PHRASES) {
          if (text && text.includes(phrase)) {
            issues.push({
              id: dest.id,
              entityType: 'DESTINATION',
              entityName: dest.cityAr || dest.slug,
              issueType: 'FORBIDDEN_PHRASE',
              issueDetails: `Contains forbidden phrase: ${phrase}`,
              severity: 'critical',
            });
          }
        }
      }
    }

    // Check templates
    const templates = await prisma.tripTemplate.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        slug: true,
        titleAr: true,
        cityAr: true,
        summaryAr: true,
        disclaimersAr: true,
      },
    });

    for (const tmpl of templates) {
      if (TEST_PATTERNS.some(pattern => pattern.test(tmpl.slug))) {
        issues.push({
          id: tmpl.id,
          entityType: 'TEMPLATE',
          entityName: tmpl.titleAr || tmpl.slug,
          issueType: 'TEST_SLUG',
          issueDetails: `Slug contains test pattern: ${tmpl.slug}`,
          severity: 'critical',
        });
      }

      if (!tmpl.summaryAr || tmpl.summaryAr.length < 10) {
        issues.push({
          id: tmpl.id,
          entityType: 'TEMPLATE',
          entityName: tmpl.titleAr || tmpl.slug,
          issueType: 'MISSING_SUMMARY',
          issueDetails: 'summaryAr is missing or too short',
          severity: 'warning',
        });
      }

      // Check forbidden phrases
      const textFields = [tmpl.titleAr, tmpl.summaryAr].filter(Boolean);
      for (const text of textFields) {
        for (const phrase of FORBIDDEN_PHRASES) {
          if (text && text.includes(phrase)) {
            issues.push({
              id: tmpl.id,
              entityType: 'TEMPLATE',
              entityName: tmpl.titleAr || tmpl.slug,
              issueType: 'FORBIDDEN_PHRASE',
              issueDetails: `Contains forbidden phrase: ${phrase}`,
              severity: 'critical',
            });
          }
        }
      }
    }

    // Check stay guides
    const stayGuides = await prisma.stayGuide.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        titleAr: true,
        cityAr: true,
        descriptionAr: true,
      },
    });

    for (const guide of stayGuides) {
      if (!guide.descriptionAr || guide.descriptionAr.length < 10) {
        issues.push({
          id: guide.id,
          entityType: 'STAY_GUIDE',
          entityName: guide.titleAr || guide.cityAr || guide.id,
          issueType: 'MISSING_DESCRIPTION',
          issueDetails: 'descriptionAr is missing or too short',
          severity: 'warning',
        });
      }

      // Check forbidden phrases
      const textFields = [guide.titleAr, guide.descriptionAr].filter(Boolean);
      for (const text of textFields) {
        for (const phrase of FORBIDDEN_PHRASES) {
          if (text && text.includes(phrase)) {
            issues.push({
              id: guide.id,
              entityType: 'STAY_GUIDE',
              entityName: guide.titleAr || guide.cityAr || guide.id,
              issueType: 'FORBIDDEN_PHRASE',
              issueDetails: `Contains forbidden phrase: ${phrase}`,
              severity: 'critical',
            });
          }
        }
      }
    }

    return NextResponse.json({
      data: issues,
      summary: {
        total: issues.length,
        critical: issues.filter(i => i.severity === 'critical').length,
        warning: issues.filter(i => i.severity === 'warning').length,
        info: issues.filter(i => i.severity === 'info').length,
      },
    });
  } catch (error) {
    console.error('[Quality Check] Error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'خطأ في الخادم' } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireRoles(request, ['ADMIN']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await request.json();
    const { id, entityType, action } = body;

    if (!id || !entityType) {
      return NextResponse.json(
        { error: { code: 'INVALID_REQUEST', message: 'id and entityType are required' } },
        { status: 400 }
      );
    }

    if (action === 'deactivate') {
      let model: 'travelDestination' | 'tripTemplate' | 'stayGuide';
      
      switch (entityType) {
        case 'DESTINATION':
          model = 'travelDestination';
          break;
        case 'TEMPLATE':
          model = 'tripTemplate';
          break;
        case 'STAY_GUIDE':
          model = 'stayGuide';
          break;
        default:
          return NextResponse.json(
            { error: { code: 'INVALID_ENTITY_TYPE', message: 'Invalid entityType' } },
            { status: 400 }
          );
      }

      const result = await (prisma[model] as typeof prisma.travelDestination).update({
        where: { id },
        data: { status: 'INACTIVE' },
      });

      await writeAuditLog({
        request,
        actorId: authResult.user.userId,
        actorRole: authResult.user.role,
        action: 'QUALITY_DEACTIVATE',
        entityType,
        entityId: id,
        details: { entityName: (result as { cityAr?: string; titleAr?: string }).cityAr || (result as { titleAr?: string }).titleAr || id },
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: { code: 'INVALID_ACTION', message: 'Invalid action' } },
      { status: 400 }
    );
  } catch (error) {
    console.error('[Quality Action] Error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'خطأ في الخادم' } },
      { status: 500 }
    );
  }
}
