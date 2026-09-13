import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      clientId,
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

    if (!clientId) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
    }

    const start = startDate ? new Date(startDate) : new Date();
    let calculatedExpiry = expiryDate ? new Date(expiryDate) : null;

    if (!calculatedExpiry && validityDays) {
      calculatedExpiry = new Date(start.getTime() + Number(validityDays) * 24 * 60 * 60 * 1000);
    } else if (!calculatedExpiry) {
      calculatedExpiry = new Date(start.getTime() + 60 * 24 * 60 * 60 * 1000);
    }

    const sessions = Number(totalSessions) || 12;
    const paid = Number(pricePaid) || 0;
    const balance = Number(balanceRemaining) !== undefined ? Number(balanceRemaining) : 0;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create client package
      const clientPkg = await tx.clientPackage.create({
        data: {
          clientId,
          packageId: packageId || null,
          name: name || 'Custom Clinical Package',
          serviceType: serviceType || 'SEMI_PRIVATE',
          totalSessions: sessions,
          sessionsUsed: 0,
          sessionsRemaining: sessions,
          pricePaid: paid,
          balanceRemaining: balance,
          startDate: start,
          expiryDate: calculatedExpiry,
          status: 'ACTIVE',
        },
        include: {
          client: true,
          package: true,
        },
      });

      // 2. If client has an initial payment recorded, create payment record
      if (paid > 0) {
        const count = await tx.payment.count();
        const invoiceNum = `INV-AUR-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
        await tx.payment.create({
          data: {
            clientId,
            clientPackageId: clientPkg.id,
            amount: paid,
            balanceRemaining: balance,
            paymentDate: new Date(),
            paymentMethod: 'UPI',
            invoiceNumber: invoiceNum,
            status: balance <= 0 ? 'PAID' : 'PARTIAL',
            notes: `Initial payment for ${name || 'Package'}`,
            isRefund: false,
          },
        });
      }

      // 3. Set client status to ACTIVE
      await tx.client.update({
        where: { id: clientId },
        data: { status: 'ACTIVE' },
      });

      return clientPkg;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err: any) {
    console.error('Error assigning client package:', err);
    return NextResponse.json({ error: err.message || 'Failed to assign package' }, { status: 500 });
  }
}
