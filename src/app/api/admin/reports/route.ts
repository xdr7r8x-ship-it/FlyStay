import { NextRequest, NextResponse } from 'next/server';
import { requireRoles } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const authResult = await requireRoles(request, ['ADMIN']);
  if (authResult instanceof NextResponse) return authResult;

  try {

    const { searchParams } = new URL(request.url);
    const period = parseInt(searchParams.get('period') || '30');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);

    // Get request stats
    const [requests, requestsByStatus, recentRequests] = await Promise.all([
      prisma.travelRequest.count({
        where: { createdAt: { gte: startDate } },
      }),
      prisma.travelRequest.groupBy({
        by: ['status'],
        _count: true,
        where: { createdAt: { gte: startDate } },
      }),
      prisma.travelRequest.findMany({
        where: { createdAt: { gte: startDate } },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          user: { select: { name: true, email: true } },
        },
      }),
    ]);

    // Get user stats
    const [totalUsers, newUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: { createdAt: { gte: startDate } },
      }),
    ]);

    // Get destination stats
    const topDestinations = await prisma.travelRequest.groupBy({
      by: ['cityAr'],
      _count: true,
      where: { cityAr: { not: null }, createdAt: { gte: startDate } },
      orderBy: { _count: { cityAr: 'desc' } },
      take: 5,
    });

    // Get service stats
    const topServices = await prisma.travelRequest.groupBy({
      by: ['serviceType'],
      _count: true,
      where: { createdAt: { gte: startDate } },
      orderBy: { _count: { serviceType: 'desc' } },
    });

    // Calculate average response time (time between request creation and first status change)
    const avgResponseTime = 4.5; // Placeholder - would need more complex query

    // Get monthly trend
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - i);
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);

      const count = await prisma.travelRequest.count({
        where: {
          createdAt: { gte: monthStart, lt: monthEnd },
        },
      });

      monthlyTrend.push({
        month: monthStart.toLocaleDateString('ar-SA', { month: 'long' }),
        count,
      });
    }

    return NextResponse.json({
      totalRequests: requests,
      newRequests: requestsByStatus.find(s => s.status === 'NEW')?._count || 0,
      completedRequests: requestsByStatus.filter(s => ['CONFIRMED_MANUALLY', 'CLOSED'].includes(s.status)).reduce((acc, s) => acc + s._count, 0),
      avgResponseTime,
      topDestinations: topDestinations.map(d => ({
        name: d.cityAr || 'غير محدد',
        count: d._count,
      })),
      topServices: topServices.map(s => ({
        name: s.serviceType,
        count: s._count,
      })),
      requestsByStatus: requestsByStatus.map(s => ({
        status: s.status,
        count: s._count,
      })),
      requestsByMonth: monthlyTrend,
      totalUsers,
      newUsersThisMonth: newUsers,
      openTickets: 0, // Would need support tickets table
      resolvedTickets: 0,
      avgTicketResolutionTime: 0,
    });
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json({ error: 'خطأ في جلب التقارير' }, { status: 500 });
  }
}
