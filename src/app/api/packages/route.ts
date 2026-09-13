import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { canManageMasterPackages } from '@/lib/rbac';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const packages = await prisma.package.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        _count: {
          select: { clientPackages: true },
        },
      },
    });

    return NextResponse.json(packages);
  } catch (err: any) {
    console.error('Error fetching master packages:', err);
    return NextResponse.json({ error: 'Failed to fetch packages' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;

    if (!canManageMasterPackages(userRole)) {
      return NextResponse.json(
        { error: 'Forbidden: Receptionist cannot create or edit master package pricing' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, serviceType, sessionCount, price, validityDays, active } = body;

    if (!name || !sessionCount) {
      return NextResponse.json(
        { error: 'Package name and session count are required' },
        { status: 400 }
      );
    }

    const newPackage = await prisma.package.create({
      data: {
        name,
        serviceType: serviceType || 'SEMI_PRIVATE',
        sessionCount: Number(sessionCount),
        price: Number(price) || 0,
        validityDays: Number(validityDays) || 60,
        active: active !== undefined ? active : true,
      },
    });

    return NextResponse.json(newPackage, { status: 201 });
  } catch (err: any) {
    console.error('Error creating package:', err);
    return NextResponse.json({ error: 'Failed to create package' }, { status: 500 });
  }
}
