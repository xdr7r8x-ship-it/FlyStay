import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  
  let databaseStatus = 'error';
  let databaseResponseTime = 0;
  
  try {
    // Dynamic import to avoid issues when DATABASE_URL is not set
    const { prisma } = await import('@/lib/prisma');
    
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    databaseResponseTime = Date.now() - dbStart;
    
    databaseStatus = 'ok';
  } catch (error) {
    // Check if it's a configuration error vs connection error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage.includes('DATABASE_URL') || errorMessage.includes('configuration')) {
      databaseStatus = 'not_configured';
    } else if (errorMessage.includes('connect') || errorMessage.includes('timeout')) {
      databaseStatus = 'connection_error';
    } else {
      databaseStatus = 'error';
    }
  }
  
  const responseTime = Date.now() - startTime;
  
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      api: 'ok',
      database: databaseStatus,
      databaseResponseTime: `${databaseResponseTime}ms`,
    },
    version: 'production',
    responseTime: `${responseTime}ms`,
    message: 'FlyStay API is running',
  });
}
