import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const sessionAuth = await getServerSession(authOptions);
    if (!sessionAuth?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { sessionId, clientId, status, notes } = body;

    if (!sessionId || !clientId || !status) {
      return NextResponse.json(
        { error: 'Session ID, Client ID, and Attendance Status are required' },
        { status: 400 }
      );
    }

    // Find or create attendance record
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        sessionId,
        clientId,
      },
    });

    let updatedAttendance;
    if (existingAttendance) {
      updatedAttendance = await prisma.attendance.update({
        where: { id: existingAttendance.id },
        data: {
          status,
          notes: notes !== undefined ? notes : existingAttendance.notes,
          markedAt: new Date(),
          markedByUserId: (sessionAuth.user as any).id || null,
        },
      });
    } else {
      const booking = await prisma.booking.findFirst({
        where: { sessionId, clientId },
      });

      updatedAttendance = await prisma.attendance.create({
        data: {
          sessionId,
          clientId,
          bookingId: booking?.id || null,
          status,
          notes: notes || null,
          markedAt: new Date(),
          markedByUserId: (sessionAuth.user as any).id || null,
        },
      });
    }

    return NextResponse.json(updatedAttendance);
  } catch (err: any) {
    console.error('Error updating attendance:', err);
    return NextResponse.json({ error: 'Failed to update attendance' }, { status: 500 });
  }
}
