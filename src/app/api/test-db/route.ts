import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const destinations = await prisma.travelDestination.count({ where: { status: 'ACTIVE' } });
    const templates = await prisma.tripTemplate.count({ where: { status: 'ACTIVE' } });
    const stayGuides = await prisma.stayGuide.count({ where: { status: 'ACTIVE' } });

    return NextResponse.json({
      db_status: 'connected',
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
