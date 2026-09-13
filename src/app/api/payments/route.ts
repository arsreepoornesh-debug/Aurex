import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateInvoiceNumber } from '@/lib/utils';
import { canViewRevenue } from '@/lib/rbac';

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

    const [payments, clientPackages, allClients] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          client: {
            select: { id: true, clientId: true, name: true, phone: true, email: true, status: true },
          },
          clientPackage: {
            select: { id: true, name: true, serviceType: true, totalSessions: true, sessionsRemaining: true },
          },
        },
        orderBy: { paymentDate: 'desc' },
      }),
      prisma.clientPackage.findMany({
        where: { status: 'ACTIVE' },
        include: {
          client: {
            select: { id: true, clientId: true, name: true, phone: true, email: true, status: true },
          },
          payments: {
            orderBy: { paymentDate: 'desc' },
          },
        },
        orderBy: { startDate: 'desc' },
      }),
      prisma.client.findMany({
        select: { id: true, clientId: true, name: true, phone: true, status: true },
        orderBy: { name: 'asc' },
      }),
    ]);

    return NextResponse.json({
      payments,
      clientPackages,
      clients: allClients,
    });
  } catch (err: any) {
    console.error('Error fetching payments:', err);
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { clientId, clientPackageId, amount, paymentMethod, notes, isRefund } = body;

    if (!clientId || amount === undefined) {
      return NextResponse.json(
        { error: 'Client ID and Amount are required' },
        { status: 400 }
      );
    }

    const count = await prisma.payment.count();
    const invoiceNumber = generateInvoiceNumber(count + 1);

    const paymentAmount = Number(amount);

    const result = await prisma.$transaction(async (tx) => {
      // 1. If linked to a clientPackage, update balance remaining
      let updatedPkg = null;
      let newBalance = 0;

      if (clientPackageId) {
        const pkg = await tx.clientPackage.findUnique({
          where: { id: clientPackageId },
        });

        if (pkg) {
          if (isRefund) {
            newBalance = pkg.balanceRemaining + paymentAmount;
            updatedPkg = await tx.clientPackage.update({
              where: { id: clientPackageId },
              data: {
                pricePaid: Math.max(0, pkg.pricePaid - paymentAmount),
                balanceRemaining: newBalance,
              },
            });
          } else {
            newBalance = Math.max(0, pkg.balanceRemaining - paymentAmount);
            updatedPkg = await tx.clientPackage.update({
              where: { id: clientPackageId },
              data: {
                pricePaid: pkg.pricePaid + paymentAmount,
                balanceRemaining: newBalance,
              },
            });
          }
        }
      }

      // 2. Create Payment Record
      const payment = await tx.payment.create({
        data: {
          clientId,
          clientPackageId: clientPackageId || null,
          amount: paymentAmount,
          balanceRemaining: newBalance,
          paymentDate: new Date(),
          paymentMethod: paymentMethod || 'UPI',
          invoiceNumber,
          status: newBalance <= 0 ? 'PAID' : 'PARTIAL',
          notes: notes || null,
          isRefund: Boolean(isRefund),
        },
        include: {
          client: true,
          clientPackage: true,
        },
      });

      return payment;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err: any) {
    console.error('Error creating payment record:', err);
    return NextResponse.json({ error: 'Failed to record payment' }, { status: 500 });
  }
}
