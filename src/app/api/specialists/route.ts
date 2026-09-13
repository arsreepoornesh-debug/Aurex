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

    const specialists = await prisma.specialist.findMany({
      where: { active: true },
      include: {
        _count: {
          select: {
            clients: true,
            sessions: true,
            assessments: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(specialists);
  } catch (err: any) {
    console.error('Error fetching specialists:', err);
    return NextResponse.json({ error: 'Failed to fetch specialists' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;

    if (userRole !== 'OWNER' && userRole !== 'MANAGER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, phone, specialization, bio, colorCode } = body;

    if (!name || !email || !specialization) {
      return NextResponse.json(
        { error: 'Name, Email, and Specialization are required' },
        { status: 400 }
      );
    }

    const specialist = await prisma.specialist.create({
      data: {
        name,
        email,
        phone: phone || null,
        specialization,
        bio: bio || null,
        colorCode: colorCode || '#10B981',
        active: true,
      },
    });

    return NextResponse.json(specialist, { status: 201 });
  } catch (err: any) {
    console.error('Error creating specialist:', err);
    return NextResponse.json({ error: 'Failed to create specialist' }, { status: 500 });
  }
}
