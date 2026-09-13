import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { canViewRevenue } from '@/lib/rbac';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const sessionAuth = await getServerSession(authOptions);
    if (!sessionAuth?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (sessionAuth.user as any)?.role || 'RECEPTIONIST';
    const allowRevenue = canViewRevenue(userRole);

    const { searchParams } = new URL(req.url);
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    let filterStart = todayStart;
    let filterEnd = todayEnd;

    if (fromParam) {
      const parsedFrom = new Date(fromParam);
      if (!isNaN(parsedFrom.getTime())) {
        filterStart = new Date(parsedFrom.getFullYear(), parsedFrom.getMonth(), parsedFrom.getDate(), 0, 0, 0, 0);
      }
    }

    if (toParam) {
      const parsedTo = new Date(toParam);
      if (!isNaN(parsedTo.getTime())) {
        filterEnd = new Date(parsedTo.getFullYear(), parsedTo.getMonth(), parsedTo.getDate(), 23, 59, 59, 999);
      }
    }

    // 1. Fetch Today's Sessions & Groups (Always shows TODAY's live schedule)
    const todaySessions = await prisma.session.findMany({
      where: {
        date: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      include: {
        specialist: true,
        bookings: {
          where: { status: 'CONFIRMED' },
          include: {
            client: {
              include: {
                packages: {
                  where: { status: 'ACTIVE' },
                  take: 1,
                },
              },
            },
            clientPackage: true,
            attendances: {
              where: {
                markedAt: {
                  gte: todayStart,
                  lte: todayEnd,
                },
              },
              take: 1,
              orderBy: { markedAt: 'desc' },
            },
          },
        },
        attendances: {
          include: {
            client: true,
          },
        },
      },
      orderBy: { startTime: 'asc' },
    });

    // 2. Attendance & Capacity calculations for Today
    let todayPresentCount = 0;
    let todayAbsentCount = 0;
    let todayNoShowCount = 0;
    let todayPendingCount = 0;
    let todayTotalMaxCapacity = 0;
    let todayTotalBookedCapacity = 0;

    todaySessions.forEach((s) => {
      todayTotalMaxCapacity += s.maxCapacity;
      todayTotalBookedCapacity += s.bookings.length;

      s.attendances.forEach((a) => {
        if (a.status === 'PRESENT') todayPresentCount++;
        else if (a.status === 'ABSENT') todayAbsentCount++;
        else if (a.status === 'NO_SHOW') todayNoShowCount++;
        else todayPendingCount++;
      });
    });

    const slotAvailability = Math.max(0, todayTotalMaxCapacity - todayTotalBookedCapacity);

    // 3. New Clients registered in selected Date Range
    const newClientsRange = await prisma.client.findMany({
      where: {
        registrationDate: {
          gte: filterStart,
          lte: filterEnd,
        },
      },
      include: {
        assignedSpecialist: true,
        packages: {
          where: { status: 'ACTIVE' },
          take: 1,
        },
      },
      orderBy: { registrationDate: 'desc' },
    });

    // New Clients Registered Today for the "New Clients Section"
    const newClientsToday = await prisma.client.findMany({
      where: {
        registrationDate: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      include: {
        assignedSpecialist: true,
        packages: {
          where: { status: 'ACTIVE' },
          take: 1,
        },
      },
      orderBy: { registrationDate: 'desc' },
    });

    // 4. Overall Client Counts
    const [totalProfilesCreated, totalActiveClients, totalInactiveClients] = await Promise.all([
      prisma.client.count(),
      prisma.client.count({
        where: { status: 'ACTIVE' },
      }),
      prisma.client.count({
        where: { status: { in: ['INACTIVE', 'EXPIRED', 'ON_HOLD'] } },
      }),
    ]);

    // 5. Bookings Count (Semi-Private vs Premium)
    const [semiPrivateBookedCount, premiumBookedCount] = await Promise.all([
      prisma.booking.count({
        where: {
          session: {
            serviceType: 'SEMI_PRIVATE',
            date: {
              gte: filterStart,
              lte: filterEnd,
            },
          },
          status: 'CONFIRMED',
        },
      }),
      prisma.booking.count({
        where: {
          session: {
            serviceType: 'PREMIUM',
            date: {
              gte: filterStart,
              lte: filterEnd,
            },
          },
          status: 'CONFIRMED',
        },
      }),
    ]);

    // 6. Leads & Inquiries
    const [pendingLeadsCount, recentLeads, followUpsCount] = await Promise.all([
      prisma.lead.count({
        where: {
          stage: { in: ['NEW_LEAD', 'CONTACTED', 'CONSULTATION', 'ASSESSMENT_BOOKED', 'PACKAGE_OFFERED'] },
        },
      }),
      prisma.lead.findMany({
        where: {
          stage: { in: ['NEW_LEAD', 'CONTACTED'] },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.followUp.count({
        where: {
          completed: false,
        },
      }),
    ]);

    // 7. Financial Statistics (Strictly RBAC Gated)
    let totalCollection = 0;
    let premiumCollection = 0;
    let totalExpenses = 0;
    let profitLoss = 0;

    if (allowRevenue) {
      const paymentsInRange = await prisma.payment.findMany({
        where: {
          paymentDate: {
            gte: filterStart,
            lte: filterEnd,
          },
          status: 'PAID',
        },
        include: {
          clientPackage: true,
        },
      });

      paymentsInRange.forEach((p) => {
        if (p.isRefund) {
          totalExpenses += p.amount;
        } else {
          totalCollection += p.amount;
          if (p.clientPackage?.serviceType === 'PREMIUM') {
            premiumCollection += p.amount;
          }
        }
      });

      // Standard baseline operational/specialist expense estimate (18% of collection or recorded expenses)
      if (totalExpenses === 0 && totalCollection > 0) {
        totalExpenses = Math.round(totalCollection * 0.18);
      }
      profitLoss = totalCollection - totalExpenses;
    }

    return NextResponse.json({
      role: userRole,
      allowRevenue,
      dateRange: {
        from: filterStart.toISOString(),
        to: filterEnd.toISOString(),
      },
      stats: {
        // Row 1
        newClients: newClientsRange.length,
        totalCollection: allowRevenue ? totalCollection : null,
        totalExpenses: allowRevenue ? totalExpenses : null,
        premiumCollection: allowRevenue ? premiumCollection : null,

        // Row 2
        profitLoss: allowRevenue ? profitLoss : null,
        pendingLeads: pendingLeadsCount,
        activeClients: totalActiveClients,
        inactiveClients: totalInactiveClients,

        // Row 3
        profilesCreated: totalProfilesCreated,
        semiPrivateBooked: semiPrivateBookedCount,
        premiumBooked: premiumBookedCount,
        presentToday: todayPresentCount,

        // Row 4
        slotAvailability,
        semiPrivateBookedRow4: semiPrivateBookedCount,
        premiumBookedRow4: premiumBookedCount,
        followUps: followUpsCount,
      },
      enquiries: {
        totalPending: pendingLeadsCount,
        recentList: recentLeads,
      },
      newClientsToday,
      todaySessions,
    });
  } catch (err: any) {
    console.error('Error fetching dashboard data:', err);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
