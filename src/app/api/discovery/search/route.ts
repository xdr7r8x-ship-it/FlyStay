/**
 * Discovery Search API
 * GET /api/discovery/search
 * 
 * Returns destinations, templates, and stay guides based on filters.
 * Uses static data as fallback when database is unavailable.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  staticDestinations, 
  staticTemplates, 
  staticStayGuides 
} from '@/lib/encyclopedia/static-data';

function filterStaticData(params: {
  q?: string;
  country?: string;
  city?: string;
  travelStyle?: string;
  budgetLevel?: string;
  serviceType?: string;
}) {
  let destinations = [...staticDestinations];
  let templates = [...staticTemplates];
  let stayGuides = [...staticStayGuides];

  // Filter destinations
  if (params.q) {
    const q = params.q.toLowerCase();
    destinations = destinations.filter(d => 
      d.cityAr.includes(q) || 
      d.countryAr.includes(q) || 
      d.descriptionAr.includes(q)
    );
  }
  if (params.country) {
    destinations = destinations.filter(d => d.countryAr === params.country);
  }
  if (params.city) {
    destinations = destinations.filter(d => d.cityAr.includes(params.city!));
  }
  if (params.travelStyle) {
    destinations = destinations.filter(d => d.travelStyles.includes(params.travelStyle!));
  }
  if (params.budgetLevel) {
    destinations = destinations.filter(d => d.budgetLevel === params.budgetLevel);
  }

  // Filter templates
  if (params.q) {
    const q = params.q.toLowerCase();
    templates = templates.filter(t => 
      t.titleAr.includes(q) || 
      t.summaryAr.includes(q)
    );
  }
  if (params.city) {
    templates = templates.filter(t => t.cityAr?.includes(params.city!));
  }
  if (params.travelStyle) {
    templates = templates.filter(t => t.idealFor.includes(params.travelStyle!));
  }
  if (params.budgetLevel) {
    templates = templates.filter(t => t.budgetLevel === params.budgetLevel);
  }
  if (params.serviceType) {
    templates = templates.filter(t => t.serviceType === params.serviceType);
  }

  // Filter stay guides
  if (params.q) {
    const q = params.q.toLowerCase();
    stayGuides = stayGuides.filter(s => 
      s.titleAr.includes(q) || 
      s.descriptionAr.includes(q)
    );
  }
  if (params.city) {
    stayGuides = stayGuides.filter(s => s.cityAr.includes(params.city!));
  }
  if (params.budgetLevel) {
    stayGuides = stayGuides.filter(s => s.budgetLevel === params.budgetLevel);
  }

  return { destinations, templates, stayGuides };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const q = searchParams.get('q') || undefined;
    const country = searchParams.get('country') || undefined;
    const city = searchParams.get('city') || undefined;
    const travelStyle = searchParams.get('travelStyle') || undefined;
    const budgetLevel = searchParams.get('budgetLevel') || undefined;
    const serviceType = searchParams.get('serviceType') || undefined;

    // Try database first
    try {
      const destWhere: Record<string, unknown> = { status: 'ACTIVE' };
      if (q) {
        destWhere.OR = [
          { cityAr: { contains: q, mode: 'insensitive' } },
          { countryAr: { contains: q, mode: 'insensitive' } },
        ];
      }
      if (country) destWhere.countryAr = country;
      if (travelStyle) destWhere.travelStyles = { has: travelStyle };
      if (budgetLevel) destWhere.budgetLevel = budgetLevel;

      const templateWhere: Record<string, unknown> = { status: 'ACTIVE' };
      if (q) {
        templateWhere.OR = [
          { titleAr: { contains: q, mode: 'insensitive' } },
          { summaryAr: { contains: q, mode: 'insensitive' } },
        ];
      }
      if (city) templateWhere.cityAr = { contains: city, mode: 'insensitive' };
      if (travelStyle) templateWhere.idealFor = { has: travelStyle };
      if (budgetLevel) templateWhere.budgetLevel = budgetLevel;
      if (serviceType) templateWhere.serviceType = serviceType;

      const stayWhere: Record<string, unknown> = { status: 'ACTIVE' };
      if (q) {
        stayWhere.OR = [
          { titleAr: { contains: q, mode: 'insensitive' } },
          { descriptionAr: { contains: q, mode: 'insensitive' } },
        ];
      }
      if (city) stayWhere.cityAr = { contains: city, mode: 'insensitive' };
      if (budgetLevel) stayWhere.budgetLevel = budgetLevel;

      const [destinations, templates, stayGuides] = await Promise.all([
        prisma.travelDestination.findMany({
          where: destWhere,
          select: {
            id: true, slug: true, cityAr: true, cityEn: true,
            countryAr: true, shortSummaryAr: true, travelStyles: true,
            budgetLevel: true, heroImageUrl: true, topActivitiesAr: true,
          },
          take: 20,
          orderBy: { cityAr: 'asc' },
        }),
        prisma.tripTemplate.findMany({
          where: templateWhere,
          select: {
            id: true, slug: true, titleAr: true, serviceType: true,
            cityAr: true, summaryAr: true, idealFor: true,
            durationDays: true, budgetLevel: true,
          },
          take: 10,
        }),
        prisma.stayGuide.findMany({
          where: stayWhere,
          select: {
            id: true, type: true, cityAr: true, titleAr: true,
            descriptionAr: true, featuresAr: true, idealFor: true,
            hasPoolHint: true, budgetLevel: true,
          },
          take: 10,
        }),
      ]);

      return NextResponse.json({
        destinations,
        templates,
        stayGuides,
        counts: {
          destinations: destinations.length,
          templates: templates.length,
          stayGuides: stayGuides.length,
        },
        source: 'database',
      });
    } catch {
      // Fallback to static data
      const { destinations, templates, stayGuides } = filterStaticData({
        q, country, city, travelStyle, budgetLevel, serviceType
      });

      return NextResponse.json({
        destinations,
        templates,
        stayGuides,
        counts: {
          destinations: destinations.length,
          templates: templates.length,
          stayGuides: stayGuides.length,
        },
        source: 'static',
      });
    }
  } catch (error) {
    console.error('[Discovery] Error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'خطأ في الخادم.' } },
      { status: 500 }
    );
  }
}
