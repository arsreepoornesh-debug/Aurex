import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateClientId } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.toLowerCase() || '';
    const status = searchParams.get('status') || '';
    const specialistId = searchParams.get('specialistId') || '';

    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }
    if (specialistId && specialistId !== 'ALL') {
      where.assignedSpecialistId = specialistId;
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } },
        { clientId: { contains: search } },
      ];
    }

    const clients = await prisma.client.findMany({
      where,
      include: {
        assignedSpecialist: true,
        packages: {
          where: { status: 'ACTIVE' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            attendances: true,
            assessments: true,
            payments: true,
          },
        },
      },
      orderBy: { registrationDate: 'desc' },
    });

    return NextResponse.json(clients);
  } catch (err: any) {
    console.error('Error fetching clients:', err);
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      phone,
      email,
      dob,
      gender,
      address,
      emergencyContactName,
      emergencyContactPhone,
      referralSource,
      status,
      assignedSpecialistId,
    } = body;

    if (!name || !phone) {
      return NextResponse.json({ error: 'Name and Phone are required' }, { status: 400 });
    }

    // Auto generate Client ID
    const count = await prisma.client.count();
    const clientId = generateClientId(count + 1);

    const newClient = await prisma.client.create({
      data: {
        clientId,
        name,
        phone,
        email: email || null,
        dob: dob ? new Date(dob) : null,
        gender: gender || null,
        address: address || null,
        emergencyContactName: emergencyContactName || null,
        emergencyContactPhone: emergencyContactPhone || null,
        registrationDate: new Date(),
        referralSource: referralSource || 'Walk-in',
        status: status || 'LEAD',
        assignedSpecialistId: assignedSpecialistId || null,
      },
      include: {
        assignedSpecialist: true,
      },
    });

    return NextResponse.json(newClient, { status: 201 });
  } catch (err: any) {
    console.error('Error creating client:', err);
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session?.user as any)?.role;
    if (userRole !== 'OWNER' && userRole !== 'MANAGER' && userRole !== 'RECEPTIONIST') {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions to remove clients' },
        { status: 403 }
      );
    }


    const body = await req.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No client IDs provided' }, { status: 400 });
    }

    // Find affected sessions
    const bookings = await prisma.booking.findMany({
      where: { clientId: { in: ids } },
      select: { sessionId: true },
    });
    const affectedSessionIds = Array.from(
      new Set(bookings.map((b) => b.sessionId).filter(Boolean))
    );

    await prisma.$transaction(async (tx) => {
      await tx.client.deleteMany({
        where: { id: { in: ids } },
      });

      for (const sessId of affectedSessionIds) {
        const activeCount = await tx.booking.count({
          where: { sessionId: sessId, status: 'CONFIRMED' },
        });
        await tx.session.update({
          where: { id: sessId },
          data: { currentCapacity: activeCount },
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: `${ids.length} client(s) removed successfully`,
    });
  } catch (err: any) {
    console.error('Error deleting multiple clients:', err);
    return NextResponse.json({ error: 'Failed to remove clients' }, { status: 500 });
  }
}

