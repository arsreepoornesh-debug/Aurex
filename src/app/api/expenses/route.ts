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

    const role = (session.user as any).role;
    if (role === 'RECEPTIONIST') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const expenses = await prisma.expense.findMany({
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(expenses);
  } catch (err: any) {
    console.error('Error fetching expenses:', err);
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = (session.user as any).role;
    if (role === 'RECEPTIONIST') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { description, amount, category, date } = body;

    if (!description || !amount) {
      return NextResponse.json({ error: 'Description and amount required' }, { status: 400 });
    }

    const expense = await prisma.expense.create({
      data: {
        description,
        amount: Number(amount),
        category: category || 'OPERATIONAL',
        date: date ? new Date(date) : new Date(),
        loggedByUserId: (session.user as any).id || null,
      },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (err: any) {
    console.error('Error creating expense:', err);
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 });
  }
}
