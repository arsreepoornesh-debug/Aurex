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
    const clientId = searchParams.get('clientId');

    const where: any = {};
    if (clientId) {
      where.clientId = clientId;
    }

    const assessments = await prisma.assessment.findMany({
      where,
      include: {
        client: { select: { id: true, clientId: true, name: true, phone: true } },
        specialist: { select: { id: true, name: true, specialization: true } },
      },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(assessments);
  } catch (err: any) {
    console.error('Error fetching assessments:', err);
    return NextResponse.json({ error: 'Failed to fetch assessments' }, { status: 500 });
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
      clientId,
      specialistId,
      type,
      healthScreening,
      medicalHistory,
      goals,
      baselineMetrics,
      functionalMovement,
      cardioStrength,
      clinicalNotes,
    } = body;

    if (!clientId) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
    }

    const assessment = await prisma.assessment.create({
      data: {
        clientId,
        specialistId: specialistId || null,
        type: type || 'INITIAL',
        date: new Date(),
        healthScreening: typeof healthScreening === 'object' ? JSON.stringify(healthScreening) : healthScreening,
        medicalHistory: typeof medicalHistory === 'object' ? JSON.stringify(medicalHistory) : medicalHistory,
        goals: typeof goals === 'object' ? JSON.stringify(goals) : goals,
        baselineMetrics: typeof baselineMetrics === 'object' ? JSON.stringify(baselineMetrics) : baselineMetrics,
        functionalMovement: typeof functionalMovement === 'object' ? JSON.stringify(functionalMovement) : functionalMovement,
        cardioStrength: typeof cardioStrength === 'object' ? JSON.stringify(cardioStrength) : cardioStrength,
        clinicalNotes: typeof clinicalNotes === 'object' ? JSON.stringify(clinicalNotes) : clinicalNotes,
      },
      include: {
        client: true,
        specialist: true,
      },
    });

    // Update client status if needed
    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (client && (client.status === 'LEAD' || client.status === 'CONSULTATION' || client.status === 'ASSESSMENT_BOOKED')) {
      await prisma.client.update({
        where: { id: clientId },
        data: { status: 'ACTIVE' },
      });
    }

    return NextResponse.json(assessment, { status: 201 });
  } catch (err: any) {
    console.error('Error creating assessment:', err);
    return NextResponse.json({ error: 'Failed to create assessment' }, { status: 500 });
  }
}
