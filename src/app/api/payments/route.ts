import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateInvoiceId } from '@/lib/invoiceId';

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
            select: { id: true, clientId: true, name: true, phone: true, email: true, status: true, photo: true },
          },
          clientPackage: {
            select: { id: true, name: true, serviceType: true, totalSessions: true, sessionsRemaining: true, packageAmount: true, amountPaid: true, balanceRemaining: true },
          },
        },
        orderBy: { paymentDate: 'desc' },
      }),
      prisma.clientPackage.findMany({
        where: { status: 'ACTIVE' },
        include: {
          client: {
            select: { id: true, clientId: true, name: true, phone: true, email: true, status: true, photo: true },
          },
          payments: {
            orderBy: { paymentDate: 'desc' },
          },
        },
        orderBy: { startDate: 'desc' },
      }),
      prisma.client.findMany({
        where: { isDeleted: false },
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
    const { clientId, clientPackageId, amount, paymentMethod, notes, isRefund, refundReason } = body;

    if (!clientId || amount === undefined) {
      return NextResponse.json(
        { error: 'Client ID and Amount are required' },
        { status: 400 }
      );
    }

    // Auto-generate invoice number formatted as INV-AUR-YYYY-XXXX
    const invoiceNumber = await generateInvoiceId();
    const paymentAmount = Number(amount);
    const currentUserId = (session.user as any).id;

    const result = await prisma.$transaction(async (tx) => {
      // 1. If linked to a clientPackage, update balance remaining
      let newBalance = 0;
      let totalPackageAmount = paymentAmount;

      if (clientPackageId) {
        const pkg = await tx.clientPackage.findUnique({
          where: { id: clientPackageId },
        });

        if (pkg) {
          totalPackageAmount = pkg.packageAmount || paymentAmount;
          if (isRefund) {
            newBalance = pkg.balanceRemaining + paymentAmount;
            await tx.clientPackage.update({
              where: { id: clientPackageId },
              data: {
                amountPaid: Math.max(0, pkg.amountPaid - paymentAmount),
                balanceRemaining: newBalance,
              },
            });
          } else {
            newBalance = Math.max(0, pkg.balanceRemaining - paymentAmount);
            await tx.clientPackage.update({
              where: { id: clientPackageId },
              data: {
                amountPaid: pkg.amountPaid + paymentAmount,
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
          packageAmount: totalPackageAmount,
          amountPaid: paymentAmount,
          balanceRemaining: newBalance,
          paymentDate: new Date(),
          paymentMethod: paymentMethod || 'UPI',
          invoiceNumber,
          status: newBalance <= 0 ? 'PAID' : 'PARTIAL',
          notes: notes || null,
          isRefund: Boolean(isRefund),
          refundReason: refundReason || null,
          createdByUserId: currentUserId || null,
        },
        include: {
          client: true,
          clientPackage: true,
        },
      });

      // 3. Write Audit Log
      await tx.auditLog.create({
        data: {
          userId: currentUserId || null,
          action: isRefund ? 'REFUND_PAYMENT' : 'RECORD_PAYMENT',
          entity: 'Payment',
          entityId: payment.id,
          details: JSON.stringify({
            invoiceNumber,
            amount: paymentAmount,
            method: paymentMethod,
            client: payment.client.name,
          }),
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
