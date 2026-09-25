import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { clientPackageId, freezeStartDate, freezeEndDate, reason } = body;

    if (!clientPackageId || !freezeStartDate) {
      return NextResponse.json(
        { error: 'Client Package ID and Freeze Start Date are required' },
        { status: 400 }
      );
    }

    const currentUserId = (session.user as any).id;
    const startDate = new Date(freezeStartDate);
    const endDate = freezeEndDate ? new Date(freezeEndDate) : null;

    // Calculate days to extend if end date is provided
    let daysToAdd = 0;
    if (endDate) {
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      daysToAdd = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    const result = await prisma.$transaction(async (tx) => {
      const pkg = await tx.clientPackage.findUnique({
        where: { id: clientPackageId },
        include: { client: true },
      });

      if (!pkg) {
        throw new Error('Client Package not found');
      }

      // Calculate new expiry date if daysToAdd > 0
      const currentExpiry = new Date(pkg.expiryDate);
      const newExpiry = daysToAdd > 0
        ? new Date(currentExpiry.getTime() + daysToAdd * 24 * 60 * 60 * 1000)
        : currentExpiry;

      // 1. Update ClientPackage
      const updatedPackage = await tx.clientPackage.update({
        where: { id: clientPackageId },
        data: {
          status: 'FROZEN',
          freezeStartDate: startDate,
          freezeEndDate: endDate,
          freezeReason: reason || 'Medical / Personal Hold',
          expiryAdjustment: (pkg.expiryAdjustment || 0) + daysToAdd,
          expiryDate: newExpiry,
        },
      });

      // 2. Create PackageFreeze record
      const freezeRecord = await tx.packageFreeze.create({
        data: {
          clientPackageId,
          clientId: pkg.clientId,
          freezeStartDate: startDate,
          freezeEndDate: endDate,
          reason: reason || 'Hold requested by client',
          daysAdded: daysToAdd,
          status: 'ACTIVE',
          approvedByUserId: currentUserId || null,
        },
      });

      // 3. Write Audit Log
      await tx.auditLog.create({
        data: {
          userId: currentUserId || null,
          action: 'FREEZE_PACKAGE',
          entity: 'ClientPackage',
          entityId: clientPackageId,
          details: JSON.stringify({
            client: pkg.client.name,
            package: pkg.name,
            daysAdded: daysToAdd,
            reason,
          }),
        },
      });

      return { package: updatedPackage, freeze: freezeRecord };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err: any) {
    console.error('Error freezing package:', err);
    return NextResponse.json({ error: err.message || 'Failed to freeze package' }, { status: 500 });
  }
}
