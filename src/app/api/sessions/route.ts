import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getServiceMaxCapacity } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date');
    const specialistId = searchParams.get('specialistId');

    let targetDate = new Date();
    if (dateParam) {
      targetDate = new Date(dateParam);
    }

    // Set to start of day and end of day
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const where: any = {
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
    };

    if (specialistId && specialistId !== 'ALL') {
      where.specialistId = specialistId;
    }

    const sessions = await prisma.session.findMany({
      where,
      include: {
        specialist: true,
        bookings: {
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

    return NextResponse.json(sessions);
  } catch (err: any) {
    console.error('Error fetching sessions:', err);
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, date, startTime, endTime, serviceType, specialistId, notes } = body;

    if (!startTime || !endTime || !serviceType || !specialistId) {
      return NextResponse.json(
        { error: 'Start time, End time, Service type, and Specialist are required' },
        { status: 400 }
      );
    }

    const maxCap = getServiceMaxCapacity(serviceType);
    const sessionDate = date ? new Date(date) : new Date();

    const newSession = await prisma.session.create({
      data: {
        title: title || `${serviceType.replace('_', ' ')} Session (${startTime}-${endTime})`,
        date: sessionDate,
        startTime,
        endTime,
        serviceType,
        specialistId,
        maxCapacity: maxCap,
        currentCapacity: 0,
        status: 'CONFIRMED',
        notes: notes || null,
      },
      include: {
        specialist: true,
      },
    });

    return NextResponse.json(newSession, { status: 201 });
  } catch (err: any) {
    console.error('Error creating session:', err);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}
