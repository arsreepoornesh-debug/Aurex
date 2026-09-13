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

    const followUps = await prisma.followUp.findMany({
      include: {
        lead: true,
        client: {
          include: {
            assignedSpecialist: true,
            packages: { where: { status: 'ACTIVE' }, take: 1 },
          },
        },
        loggedByUser: true,
      },
      orderBy: { followUpDate: 'asc' },
    });

    return NextResponse.json(followUps);
  } catch (err: any) {
    console.error('Error fetching follow-ups:', err);
    return NextResponse.json({ error: 'Failed to fetch follow-ups' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { leadId, clientId, type, notes, followUpDate } = body;

    if (!notes) {
      return NextResponse.json({ error: 'Notes are required' }, { status: 400 });
    }

    const followUp = await prisma.followUp.create({
      data: {
        leadId: leadId || null,
        clientId: clientId || null,
        type: type || 'CALL',
        notes,
        followUpDate: followUpDate ? new Date(followUpDate) : new Date(),
        completed: false,
        loggedByUserId: (session.user as any)?.id || null,
      },
      include: {
        lead: true,
        client: true,
      },
    });

    return NextResponse.json(followUp, { status: 201 });
  } catch (err: any) {
    console.error('Error creating follow-up:', err);
    return NextResponse.json({ error: 'Failed to create follow-up' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, completed, notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Follow-up ID is required' }, { status: 400 });
    }

    const updated = await prisma.followUp.update({
      where: { id },
      data: {
        ...(completed !== undefined ? { completed } : {}),
        ...(notes !== undefined ? { notes } : {}),
      },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error('Error updating follow-up:', err);
    return NextResponse.json({ error: 'Failed to update follow-up' }, { status: 500 });
  }
}
