import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(
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
      packageId,
      name,
      serviceType,
      totalSessions,
      pricePaid,
      balanceRemaining,
      startDate,
      validityDays,
      expiryDate,
    } = body;

    const start = startDate ? new Date(startDate) : new Date();
    let calculatedExpiry = expiryDate ? new Date(expiryDate) : null;

    if (!calculatedExpiry && validityDays) {
      calculatedExpiry = new Date(start.getTime() + validityDays * 24 * 60 * 60 * 1000);
    } else if (!calculatedExpiry) {
      calculatedExpiry = new Date(start.getTime() + 60 * 24 * 60 * 60 * 1000);
    }

    const clientPackage = await prisma.clientPackage.create({
      data: {
        clientId: params.id,
        packageId: packageId || null,
        name: name || 'Custom Package',
        serviceType: serviceType || 'SEMI_PRIVATE',
        totalSessions: Number(totalSessions) || 12,
        sessionsUsed: 0,
        sessionsRemaining: Number(totalSessions) || 12,
        pricePaid: Number(pricePaid) || 0,
        balanceRemaining: Number(balanceRemaining) || 0,
        startDate: start,
        expiryDate: calculatedExpiry,
        status: 'ACTIVE',
      },
    });

    // Auto set client status to ACTIVE if it was LEAD / CONSULTATION / ASSESSMENT_BOOKED
    await prisma.client.update({
      where: { id: params.id },
      data: { status: 'ACTIVE' },
    });

    return NextResponse.json(clientPackage, { status: 201 });
  } catch (err: any) {
    console.error('Error assigning client package:', err);
    return NextResponse.json({ error: 'Failed to assign package' }, { status: 500 });
  }
}
