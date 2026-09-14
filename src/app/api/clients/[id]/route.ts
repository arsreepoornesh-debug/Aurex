import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await prisma.client.findFirst({
      where: {
        OR: [{ id: params.id }, { clientId: params.id }],
      },
      include: {
        assignedSpecialist: true,
        packages: {
          orderBy: { createdAt: 'desc' },
        },
        bookings: {
          include: {
            session: {
              include: {
                specialist: true,
              },
            },
          },
          orderBy: { bookedAt: 'desc' },
        },
        attendances: {
          include: {
            session: true,
            markedByUser: {
              select: { name: true, role: true },
            },
          },
          orderBy: { markedAt: 'desc' },
        },
        payments: {
          include: {
            clientPackage: true,
          },
          orderBy: { paymentDate: 'desc' },
        },
        assessments: {
          include: {
            specialist: true,
          },
          orderBy: { date: 'desc' },
        },
        notes: {
          include: {
            author: { select: { name: true, role: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        followUps: {
          include: {
            loggedByUser: { select: { name: true } },
          },
          orderBy: { followUpDate: 'desc' },
        },
      },
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    return NextResponse.json(client);
  } catch (err: any) {
    console.error('Error fetching client details:', err);
    return NextResponse.json({ error: 'Failed to fetch client details' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const updated = await prisma.client.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
        email: email || null,
        dob: dob ? new Date(dob) : null,
        gender: gender || null,
        address: address || null,
        emergencyContactName: emergencyContactName || null,
        emergencyContactPhone: emergencyContactPhone || null,
        ...(referralSource && { referralSource }),
        ...(status && { status }),
        assignedSpecialistId: assignedSpecialistId || null,
      },
      include: {
        assignedSpecialist: true,
      },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error('Error updating client:', err);
    return NextResponse.json({ error: 'Failed to update client' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session?.user as any)?.role;
    if (userRole !== 'OWNER' && userRole !== 'MANAGER' && userRole !== 'RECEPTIONIST') {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions to remove client records' },
        { status: 403 }
      );
    }


    const client = await prisma.client.findFirst({
      where: {
        OR: [{ id: params.id }, { clientId: params.id }],
      },
      include: {
        bookings: {
          select: { sessionId: true },
        },
      },
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const affectedSessionIds = Array.from(
      new Set(client.bookings.map((b) => b.sessionId).filter(Boolean))
    );

    await prisma.$transaction(async (tx) => {
      // Cascade delete handles packages, bookings, attendances, payments, assessments, notes, followups
      await tx.client.delete({
        where: { id: client.id },
      });

      // Recalculate current capacity for any affected sessions
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
      message: `Client ${client.name} (${client.clientId}) removed successfully`,
    });
  } catch (err: any) {
    console.error('Error deleting client:', err);
    return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 });
  }
}

