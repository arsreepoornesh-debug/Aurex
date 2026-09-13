import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendBookingConfirmationEmail } from '@/lib/notifications';
import { formatDate } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const sessionAuth = await getServerSession(authOptions);
    if (!sessionAuth?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { sessionId, clientId, clientPackageId } = body;

    if (!sessionId || !clientId) {
      return NextResponse.json(
        { error: 'Session ID and Client ID are required' },
        { status: 400 }
      );
    }

    // Execute atomic transaction for booking & capacity check
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch the session with current bookings
      const targetSession = await tx.session.findUnique({
        where: { id: sessionId },
        include: {
          specialist: true,
          bookings: {
            where: { status: 'CONFIRMED' },
          },
        },
      });

      if (!targetSession) {
        throw new Error('NOT_FOUND: Session not found');
      }

      // 2. Check if client is already booked in this session
      const existingBooking = await tx.booking.findFirst({
        where: {
          sessionId,
          clientId,
          status: 'CONFIRMED',
        },
      });

      if (existingBooking) {
        throw new Error('ALREADY_BOOKED: Client is already booked in this session slot');
      }

      // 3. Strict Capacity Enforcement
      const currentConfirmedCount = targetSession.bookings.length;
      if (currentConfirmedCount >= targetSession.maxCapacity) {
        throw new Error(
          `CAPACITY_FULL: Session is at full capacity (${targetSession.maxCapacity}/${targetSession.maxCapacity} clients). Cannot add more clients.`
        );
      }

      // 4. Resolve client's active package if not explicitly provided
      let pkgIdToUse = clientPackageId;
      if (!pkgIdToUse) {
        const activePkg = await tx.clientPackage.findFirst({
          where: {
            clientId,
            status: 'ACTIVE',
            sessionsRemaining: { gt: 0 },
          },
          orderBy: { createdAt: 'desc' },
        });
        pkgIdToUse = activePkg?.id || null;
      }

      // 5. Create Booking
      const newBooking = await tx.booking.create({
        data: {
          sessionId,
          clientId,
          clientPackageId: pkgIdToUse,
          status: 'CONFIRMED',
        },
        include: {
          client: true,
          session: {
            include: {
              specialist: true,
            },
          },
        },
      });

      // 6. Create Initial Attendance Record
      const newAttendance = await tx.attendance.create({
        data: {
          bookingId: newBooking.id,
          sessionId,
          clientId,
          status: 'PENDING',
          markedByUserId: (sessionAuth.user as any).id || null,
        },
      });

      // 7. Update Session currentCapacity count
      await tx.session.update({
        where: { id: sessionId },
        data: {
          currentCapacity: currentConfirmedCount + 1,
        },
      });

      return { booking: newBooking, attendance: newAttendance };
    });

    // Send confirmation email asynchronously
    if (result.booking.client.email) {
      sendBookingConfirmationEmail({
        toEmail: result.booking.client.email,
        clientName: result.booking.client.name,
        serviceType: result.booking.session.serviceType.replace('_', ' '),
        specialistName: result.booking.session.specialist.name,
        sessionDate: formatDate(result.booking.session.date),
        sessionTime: `${result.booking.session.startTime} - ${result.booking.session.endTime}`,
      }).catch((err) => console.error('Email send failure:', err));
    }

    return NextResponse.json(result, { status: 201 });
  } catch (err: any) {
    console.error('Error creating booking:', err.message);

    if (err.message.startsWith('CAPACITY_FULL')) {
      return NextResponse.json({ error: err.message.replace('CAPACITY_FULL: ', '') }, { status: 409 });
    }
    if (err.message.startsWith('ALREADY_BOOKED')) {
      return NextResponse.json({ error: err.message.replace('ALREADY_BOOKED: ', '') }, { status: 400 });
    }
    if (err.message.startsWith('NOT_FOUND')) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({ error: 'Failed to complete booking' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const sessionAuth = await getServerSession(authOptions);
    if (!sessionAuth?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const bookingId = searchParams.get('bookingId');

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
      });

      if (!booking) {
        throw new Error('Booking not found');
      }

      // Mark booking cancelled
      await tx.booking.update({
        where: { id: bookingId },
        data: { status: 'CANCELLED' },
      });

      // Update attendance status
      await tx.attendance.updateMany({
        where: { bookingId },
        data: { status: 'CANCELLED' },
      });

      // Recalculate confirmed capacity
      const activeCount = await tx.booking.count({
        where: {
          sessionId: booking.sessionId,
          status: 'CONFIRMED',
        },
      });

      await tx.session.update({
        where: { id: booking.sessionId },
        data: { currentCapacity: activeCount },
      });
    });

    return NextResponse.json({ success: true, message: 'Booking cancelled' });
  } catch (err: any) {
    console.error('Error cancelling booking:', err);
    return NextResponse.json({ error: 'Failed to cancel booking' }, { status: 500 });
  }
}
