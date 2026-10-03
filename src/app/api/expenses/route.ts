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
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date');

    let whereClause: any = {};

    // If date filter passed
    if (dateParam) {
      const start = new Date(dateParam);
      start.setHours(0, 0, 0, 0);
      const end = new Date(dateParam);
      end.setHours(23, 59, 59, 999);
      whereClause.date = {
        gte: start,
        lte: end,
      };
    }

    const expenses = await prisma.expense.findMany({
      where: whereClause,
      orderBy: { date: 'desc' },
      take: 100,
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

    const body = await req.json();
    const { description, amount, category, date } = body;

    if (!description || amount === undefined || amount === null || amount === '') {
      return NextResponse.json({ error: 'Please enter what was spent on and the amount' }, { status: 400 });
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount < 0) {
      return NextResponse.json({ error: 'Amount must be a valid positive number' }, { status: 400 });
    }

    const expense = await prisma.expense.create({
      data: {
        description: description.trim(),
        amount: numAmount,
        category: category || 'FRONT_DESK',
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

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Expense ID required' }, { status: 400 });
    }

    await prisma.expense.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error deleting expense:', err);
    return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 });
  }
}
