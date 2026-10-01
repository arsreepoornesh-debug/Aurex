import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateClientId } from '@/lib/clientId';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.toLowerCase() || '';
    const status = searchParams.get('status') || '';
    const specialistId = searchParams.get('specialistId') || '';
    const gender = searchParams.get('gender') || '';

    const where: any = { isDeleted: false };
    if (status && status !== 'ALL') {
      where.status = status;
    }
    if (specialistId && specialistId !== 'ALL') {
      where.assignedSpecialistId = specialistId;
    }
    if (gender && gender !== 'ALL') {
      where.gender = gender;
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } },
        { clientId: { contains: search } },
      ];
    }

    const clients = await prisma.client.findMany({
      where,
      include: {
        assignedSpecialist: true,
        packages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            attendances: true,
            assessments: true,
            payments: true,
            bookings: true,
          },
        },
      },
      orderBy: { registrationDate: 'desc' },
    });

    return NextResponse.json(clients);
  } catch (err: any) {
    console.error('Error fetching clients:', err);
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
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
      dob,
      gender,
      address,
      emergencyContact,
      emergencyPhone,
      referralSource,
      status,
      assignedSpecialistId,
      category,
      slotBookingDate,
    } = body;

    if (!name || !phone) {
      return NextResponse.json({ error: 'Name and Phone are required' }, { status: 400 });
    }

    // Auto generate Client ID formatted as AUR-YYYY-XXXX
    const clientId = await generateClientId();

    const newClient = await prisma.client.create({
      data: {
        clientId,
        name,
        phone,
        email: email || null,
        dob: dob ? new Date(dob) : null,
        gender: gender || null,
        address: address || null,
        emergencyContact: emergencyContact || null,
        emergencyPhone: emergencyPhone || null,
        registrationDate: new Date(),
        referralSource: referralSource || 'Walk-in',
        status: status || 'ACTIVE',
        assignedSpecialistId: assignedSpecialistId || null,
        category: category || 'SEMI_PRIVATE',
        slotBookingDate: slotBookingDate ? new Date(slotBookingDate) : null,
      },
      include: {
        assignedSpecialist: true,
      },
    });

    return NextResponse.json(newClient, { status: 201 });
  } catch (err: any) {
    console.error('Error creating client:', err);
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session?.user as any)?.role;
    if (userRole !== 'OWNER' && userRole !== 'MANAGER') {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions to remove clients' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No client IDs provided' }, { status: 400 });
    }

    // Soft delete clients
    await prisma.client.updateMany({
      where: { id: { in: ids } },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: `${ids.length} client(s) deleted successfully`,
    });
  } catch (err: any) {
    console.error('Error deleting multiple clients:', err);
    return NextResponse.json({ error: 'Failed to remove clients' }, { status: 500 });
  }
}
