import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';

function boolParam(value: string | null) {
  if (value === null) return undefined;
  return value === 'true' || value === '1';
}

function jsonArrayContains(value: string) {
  return { array_contains: [value] };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const q = searchParams.get('q')?.trim();
  const continent = searchParams.get('continent')?.trim();
  const country = searchParams.get('country')?.trim();
  const city = searchParams.get('city')?.trim();
  const travelStyle = searchParams.get('travelStyle')?.trim();
  const budgetLevel = searchParams.get('budgetLevel')?.trim();
  const serviceType = searchParams.get('serviceType')?.trim();
  const durationDays = searchParams.get('durationDays');
  const familyFriendly = boolParam(searchParams.get('familyFriendly'));
  const honeymoon = boolParam(searchParams.get('honeymoon'));
  const saudiOnly = boolParam(searchParams.get('saudiOnly'));

  try {
    const destWhere: Prisma.TravelDestinationWhereInput = { status: 'ACTIVE' };
    if (q) {
      destWhere.OR = [
        { cityAr: { contains: q, mode: 'insensitive' } },
        { cityEn: { contains: q, mode: 'insensitive' } },
        { countryAr: { contains: q, mode: 'insensitive' } },
        { countryEn: { contains: q, mode: 'insensitive' } },
        { descriptionAr: { contains: q, mode: 'insensitive' } },
        { shortSummaryAr: { contains: q, mode: 'insensitive' } },
        { slug: { contains: q, mode: 'insensitive' } },
      ];
    }
    if (continent) destWhere.continentAr = { contains: continent, mode: 'insensitive' };
    if (country) destWhere.countryAr = { contains: country, mode: 'insensitive' };
    if (city) destWhere.cityAr = { contains: city, mode: 'insensitive' };
    if (saudiOnly) destWhere.countryEn = 'Saudi Arabia';
    if (travelStyle) destWhere.travelStyles = jsonArrayContains(travelStyle);
    if (budgetLevel) destWhere.budgetLevel = budgetLevel;
    if (familyFriendly) destWhere.travelStyles = jsonArrayContains('FAMILY');
    if (honeymoon) destWhere.OR = [
      ...(Array.isArray(destWhere.OR) ? destWhere.OR : []),
      { travelStyles: jsonArrayContains('COUPLES') },
      { honeymoonNotesAr: { not: null } },
    ];

    const templateWhere: Prisma.TripTemplateWhereInput = { status: 'ACTIVE' };
    if (q) {
      templateWhere.OR = [
        { titleAr: { contains: q, mode: 'insensitive' } },
        { summaryAr: { contains: q, mode: 'insensitive' } },
        { cityAr: { contains: q, mode: 'insensitive' } },
        { slug: { contains: q, mode: 'insensitive' } },
      ];
    }
    if (city) templateWhere.cityAr = { contains: city, mode: 'insensitive' };
    if (travelStyle) templateWhere.idealFor = jsonArrayContains(travelStyle);
    if (familyFriendly) templateWhere.idealFor = jsonArrayContains('FAMILY');
    if (honeymoon) templateWhere.idealFor = jsonArrayContains('COUPLES');
    if (budgetLevel) templateWhere.budgetLevel = budgetLevel;
    if (serviceType) templateWhere.serviceType = serviceType;
    if (durationDays) templateWhere.durationDays = Number(durationDays);

    const stayWhere: Prisma.StayGuideWhereInput = { status: 'ACTIVE' };
    if (q) {
      stayWhere.OR = [
        { titleAr: { contains: q, mode: 'insensitive' } },
        { descriptionAr: { contains: q, mode: 'insensitive' } },
        { cityAr: { contains: q, mode: 'insensitive' } },
      ];
    }
    if (city) stayWhere.cityAr = { contains: city, mode: 'insensitive' };
    if (budgetLevel) stayWhere.budgetLevel = budgetLevel;
    if (familyFriendly) stayWhere.idealFor = jsonArrayContains('FAMILY');
    if (honeymoon) stayWhere.idealFor = jsonArrayContains('COUPLES');
    if (serviceType && ['HOTEL', 'CHALET', 'RESTHOUSE'].includes(serviceType)) {
      stayWhere.type = serviceType;
    }

    const [destinations, templates, stayGuides] = await Promise.all([
      prisma.travelDestination.findMany({
        where: destWhere,
        orderBy: { cityAr: 'asc' },
        take: 120,
      }),
      prisma.tripTemplate.findMany({
        where: templateWhere,
        orderBy: { titleAr: 'asc' },
        take: 80,
      }),
      prisma.stayGuide.findMany({
        where: stayWhere,
        orderBy: { titleAr: 'asc' },
        take: 80,
      }),
    ]);

    return NextResponse.json({
      source: 'database',
      destinations,
      templates,
      stayGuides,
      counts: {
        destinations: destinations.length,
        templates: templates.length,
        stayGuides: stayGuides.length,
      },
    });
  } catch (error) {
    console.error('[Discovery] Error:', error);
    return NextResponse.json(
      { error: { code: 'DATABASE_UNAVAILABLE', message: 'قاعدة البيانات غير متاحة للبحث الآن.' } },
      { status: 503 },
    );
  }
}
