import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentDay = now.getDate();

    // 1. Follow-ups
    const pendingFollowUps = await prisma.followUp.findMany({
      where: { completed: false },
      include: {
        lead: true,
        client: {
          include: { assignedSpecialist: true },
        },
      },
      orderBy: { followUpDate: 'asc' },
    });

    // 2. All Clients for Birthday & Anniversary Calculations
    const allClients = await prisma.client.findMany({
      include: {
        assignedSpecialist: true,
        packages: { where: { status: 'ACTIVE' }, take: 1 },
        attendances: {
          orderBy: { markedAt: 'desc' },
          take: 5,
        },
      },
    });

    // Birthday calculation (within +/- 7 days or current week)
    const birthdayClients = allClients
      .filter((c) => {
        if (!c.dob) return false;
        const dob = new Date(c.dob);
        const dobMonth = dob.getMonth();
        const dobDay = dob.getDate();

        // Check if within same month and within +/- 7 days, or matching month
        const diffDays = Math.abs((dobMonth * 31 + dobDay) - (currentMonth * 31 + currentDay));
        return diffDays <= 7 || dobMonth === currentMonth;
      })
      .map((c) => {
        const dob = new Date(c.dob!);
        const age = now.getFullYear() - dob.getFullYear();
        return {
          id: c.id,
          clientId: c.clientId,
          name: c.name,
          phone: c.phone,
          dob: c.dob,
          age,
          assignedSpecialist: c.assignedSpecialist,
        };
      });

    // Anniversary calculation (Registration anniversary this week/month)
    const anniversaryClients = allClients
      .filter((c) => {
        const reg = new Date(c.registrationDate);
        const regMonth = reg.getMonth();
        const regDay = reg.getDate();
        const yearsCompleted = now.getFullYear() - reg.getFullYear();
        const diffDays = Math.abs((regMonth * 31 + regDay) - (currentMonth * 31 + currentDay));
        return (diffDays <= 7 || regMonth === currentMonth) && yearsCompleted >= 0;
      })
      .map((c) => {
        const reg = new Date(c.registrationDate);
        const yearsCompleted = Math.max(1, now.getFullYear() - reg.getFullYear());
        return {
          id: c.id,
          clientId: c.clientId,
          name: c.name,
          phone: c.phone,
          registrationDate: c.registrationDate,
          yearsCompleted,
          status: c.status,
          assignedSpecialist: c.assignedSpecialist,
        };
      });

    // 3. Irregular Clients (clients with missed attendance or marked ABSENT/NO_SHOW 2+ times or no recent attendance)
    const irregularClients = allClients
      .filter((c) => {
        const absences = c.attendances.filter((a) => a.status === 'ABSENT' || a.status === 'NO_SHOW').length;
        return absences >= 1 || (c.status === 'ACTIVE' && c.attendances.length === 0);
      })
      .map((c) => {
        const lastAttended = c.attendances.find((a) => a.status === 'PRESENT')?.markedAt || null;
        const missedCount = c.attendances.filter((a) => a.status === 'ABSENT' || a.status === 'NO_SHOW').length || 1;
        return {
          id: c.id,
          clientId: c.clientId,
          name: c.name,
          phone: c.phone,
          lastAttendedDate: lastAttended,
          missedCount,
          assignedSpecialist: c.assignedSpecialist,
          status: c.status,
        };
      });

    // 4. Counts for Quick Manage badges
    const [pendingLeadsCount, pendingPaymentsCount, renewalsCount] = await Promise.all([
      prisma.lead.count({
        where: { stage: { in: ['NEW_LEAD', 'CONTACTED', 'CONSULTATION', 'ASSESSMENT_BOOKED'] } },
      }),
      prisma.clientPackage.count({
        where: { balanceRemaining: { gt: 0 } },
      }),
      prisma.clientPackage.count({
        where: {
          status: 'ACTIVE',
          OR: [
            { sessionsRemaining: { lte: 2 } },
            {
              expiryDate: {
                lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
              },
            },
          ],
        },
      }),
    ]);

    return NextResponse.json({
      counts: {
        followUps: pendingFollowUps.length,
        pendingLeads: pendingLeadsCount,
        pendingPayments: pendingPaymentsCount,
        renewals: renewalsCount,
        irregular: irregularClients.length,
        birthdays: birthdayClients.length,
        anniversaries: anniversaryClients.length,
      },
      followUps: pendingFollowUps,
      irregularClients,
      birthdayClients,
      anniversaryClients,
    });
  } catch (err: any) {
    console.error('Error in quick-manage API:', err);
    return NextResponse.json({ error: 'Failed to fetch quick manage data' }, { status: 500 });
  }
}
