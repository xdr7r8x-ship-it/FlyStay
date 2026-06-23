import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get URL without credentials for debugging
    const dbUrl = process.env.DATABASE_URL || 'NOT_SET';
    const dbHost = dbUrl.includes('@') ? dbUrl.split('@')[1]?.split('/')[0] : 'unknown';

    const destinations = await prisma.travelDestination.count({ where: { status: 'ACTIVE' } });
    const templates = await prisma.tripTemplate.count({ where: { status: 'ACTIVE' } });
    const stayGuides = await prisma.stayGuide.count({ where: { status: 'ACTIVE' } });

    return NextResponse.json({
      db_status: 'connected',
      db_host: dbHost,
      destinations,
      templates,
      stayGuides,
    });
  } catch (error) {
    return NextResponse.json({
      db_status: 'error',
      error: String(error),
    }, { status: 500 });
  }
}
