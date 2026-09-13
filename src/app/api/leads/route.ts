import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const stage = searchParams.get('stage');

    const where: any = {};
    if (stage && stage !== 'ALL') {
      where.stage = stage;
    }

    const leads = await prisma.lead.findMany({
      where,
      include: {
        followUps: {
          include: {
            loggedByUser: { select: { name: true } },
          },
          orderBy: { followUpDate: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(leads);
  } catch (err: any) {
    console.error('Error fetching leads:', err);
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
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
      alternatePhone,
      gender,
      stage,
      convertibility,
      source,
      service,
      trialDate,
      scheduleFollowUp,
      attendedBy,
      response,
      responseNote,
      notes,
    } = body;

    if (!name || !phone) {
      return NextResponse.json({ error: 'Name and Phone are required' }, { status: 400 });
    }

    const lead = await prisma.lead.create({
      data: {
        name,
        phone,
        email: email || null,
        alternatePhone: alternatePhone || null,
        gender: gender || 'Male',
        stage: stage || 'NEW_LEAD',
        convertibility: convertibility || 'Warm',
        source: source || 'Instagram',
        service: service || 'AUREX',
        trialDate: trialDate ? new Date(trialDate) : null,
        scheduleFollowUp: scheduleFollowUp ? new Date(scheduleFollowUp) : null,
        attendedBy: attendedBy || (session.user as any).name || 'Admin',
        response: response || null,
        responseNote: responseNote || null,
        notes: notes || null,
        assignedToUserId: (session.user as any).id || null,
      },
    });

    // If a follow-up or response was logged, create a FollowUp record
    if (scheduleFollowUp || response || responseNote) {
      await prisma.followUp.create({
        data: {
          leadId: lead.id,
          type: 'CALL',
          notes: `${response ? `[${response}] ` : ''}${responseNote || notes || 'Initial inquiry logged'}`,
          followUpDate: scheduleFollowUp ? new Date(scheduleFollowUp) : new Date(),
          completed: false,
          loggedByUserId: (session.user as any).id || null,
        },
      });
    }

    return NextResponse.json(lead, { status: 201 });
  } catch (err: any) {
    console.error('Error creating lead:', err);
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, stage, notes, convertibility, response, responseNote } = body;

    if (!id) {
      return NextResponse.json({ error: 'Lead ID is required' }, { status: 400 });
    }

    const updated = await prisma.lead.update({
      where: { id },
      data: {
        ...(stage && { stage }),
        ...(notes !== undefined && { notes }),
        ...(convertibility && { convertibility }),
        ...(response !== undefined && { response }),
        ...(responseNote !== undefined && { responseNote }),
      },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error('Error updating lead:', err);
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 });
  }
}
