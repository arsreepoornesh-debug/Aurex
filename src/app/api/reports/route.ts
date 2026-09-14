import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { canViewReports } from '@/lib/rbac';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const sessionAuth = await getServerSession(authOptions);
    if (!sessionAuth?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (sessionAuth.user as any)?.role;
    if (!canViewReports(userRole)) {
      return NextResponse.json(
        { error: 'Forbidden: Only Owner can access reports and financial analytics' },
        { status: 403 }
      );
    }


    // 1. Client Metrics
    const totalClients = await prisma.client.count();
    const activeClients = await prisma.client.count({ where: { status: 'ACTIVE' } });
    const leadClients = await prisma.client.count({ where: { status: 'LEAD' } });
    const inactiveClients = await prisma.client.count({ where: { status: 'INACTIVE' } });

    // 2. Revenue & Package Sales
    const allPayments = await prisma.payment.findMany({
      include: { clientPackage: true },
      orderBy: { paymentDate: 'desc' },
    });

    const totalRevenue = allPayments
      .filter((p) => !p.isRefund)
      .reduce((acc, p) => acc + p.amount, 0);

    const totalRefunds = allPayments
      .filter((p) => p.isRefund)
      .reduce((acc, p) => acc + p.amount, 0);

    const netRevenue = totalRevenue - totalRefunds;

    // Payment Methods Breakdown
    const paymentMethodsBreakdown: Record<string, number> = {};
    allPayments.forEach((p) => {
      paymentMethodsBreakdown[p.paymentMethod] =
        (paymentMethodsBreakdown[p.paymentMethod] || 0) + (p.isRefund ? -p.amount : p.amount);
    });

    // 3. Slot Utilisation Heatmap
    const allSessions = await prisma.session.findMany({
      include: { bookings: { where: { status: 'CONFIRMED' } } },
    });

    const slotMap: Record<string, { totalSlots: number; filledSlots: number; maxCapacity: number }> = {};
    allSessions.forEach((s) => {
      const slotKey = `${s.startTime} - ${s.endTime} (${s.serviceType.replace('_', ' ')})`;
      if (!slotMap[slotKey]) {
        slotMap[slotKey] = { totalSlots: 0, filledSlots: 0, maxCapacity: 0 };
      }
      slotMap[slotKey].totalSlots += 1;
      slotMap[slotKey].filledSlots += s.bookings.length;
      slotMap[slotKey].maxCapacity += s.maxCapacity;
    });

    const slotUtilization = Object.entries(slotMap).map(([slot, data]) => ({
      slot,
      utilizationRate: data.maxCapacity > 0 ? Math.round((data.filledSlots / data.maxCapacity) * 100) : 0,
      filled: data.filledSlots,
      capacity: data.maxCapacity,
    }));

    // 4. Lead Source & Conversion Velocity
    const allLeads = await prisma.lead.findMany();
    const sourceBreakdown: Record<string, number> = {};
    let convertedCount = 0;

    allLeads.forEach((l) => {
      sourceBreakdown[l.source] = (sourceBreakdown[l.source] || 0) + 1;
      if (l.stage === 'CONVERTED' || l.stage === 'ACTIVE') {
        convertedCount++;
      }
    });

    const conversionRate = allLeads.length > 0 ? Math.round((convertedCount / allLeads.length) * 100) : 0;

    // 5. Pending Balances
    const pendingPackages = await prisma.clientPackage.findMany({
      where: { balanceRemaining: { gt: 0 } },
      include: { client: true },
    });

    const totalPendingBalance = pendingPackages.reduce((acc, p) => acc + p.balanceRemaining, 0);

    return NextResponse.json({
      clientMetrics: {
        total: totalClients,
        active: activeClients,
        leads: leadClients,
        inactive: inactiveClients,
      },
      financialMetrics: {
        totalRevenue,
        totalRefunds,
        netRevenue,
        totalPendingBalance,
        paymentMethodsBreakdown,
      },
      slotUtilization,
      leadMetrics: {
        totalLeads: allLeads.length,
        convertedLeads: convertedCount,
        conversionRate,
        sourceBreakdown,
      },
    });
  } catch (err: any) {
    console.error('Error fetching reports data:', err);
    return NextResponse.json({ error: 'Failed to generate reports' }, { status: 500 });
  }
}
