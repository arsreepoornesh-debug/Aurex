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
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // Execute atomic completion transaction
    const completionResult = await prisma.$transaction(async (tx) => {
      // 1. Fetch Session with bookings and attendances
      const session = await tx.session.findUnique({
        where: { id: sessionId },
        include: {
          bookings: {
            where: { status: 'CONFIRMED' },
            include: {
              client: true,
              clientPackage: true,
            },
          },
          attendances: true,
        },
      });

      if (!session) {
        throw new Error('Session not found');
      }

      if (session.status === 'COMPLETED') {
        throw new Error('Session is already marked as COMPLETED');
      }

      // 2. Mark Session as COMPLETED
      await tx.session.update({
        where: { id: sessionId },
        data: { status: 'COMPLETED' },
      });

      // 3. Process each booked client
      const updatedPackages = [];

      for (const booking of session.bookings) {
        // Check attendance record for this client
        const attendance = session.attendances.find((a) => a.clientId === booking.clientId);
        
        // Auto-mark attendance as PRESENT if it was still PENDING upon completion
        if (!attendance || attendance.status === 'PENDING') {
          await tx.attendance.upsert({
            where: { id: attendance?.id || 'new-att-id' },
            update: {
              status: 'PRESENT',
              markedAt: new Date(),
              markedByUserId: (sessionAuth.user as any).id || null,
            },
            create: {
              sessionId,
              clientId: booking.clientId,
              bookingId: booking.id,
              status: 'PRESENT',
              markedAt: new Date(),
              markedByUserId: (sessionAuth.user as any).id || null,
            },
          });
        }

        // Only deduct session count if client attended (status is PRESENT)
        const isAttended = !attendance || attendance.status === 'PENDING' || attendance.status === 'PRESENT';

        if (isAttended) {
          // Find client's package to deduct from
          let clientPackage = booking.clientPackage;

          if (!clientPackage) {
            clientPackage = await tx.clientPackage.findFirst({
              where: {
                clientId: booking.clientId,
                status: 'ACTIVE',
                sessionsRemaining: { gt: 0 },
              },
              orderBy: { createdAt: 'desc' },
            });
          }

          if (clientPackage && clientPackage.sessionsRemaining > 0) {
            const newRemaining = clientPackage.sessionsRemaining - 1;
            const newUsed = clientPackage.sessionsUsed + 1;
            const isPackageFinished = newRemaining <= 0;

            const updatedPkg = await tx.clientPackage.update({
              where: { id: clientPackage.id },
              data: {
                sessionsRemaining: Math.max(0, newRemaining),
                sessionsUsed: newUsed,
                status: isPackageFinished ? 'COMPLETED' : clientPackage.status,
              },
            });

            updatedPackages.push({
              clientId: booking.clientId,
              clientName: booking.client.name,
              packageId: updatedPkg.id,
              sessionsRemaining: updatedPkg.sessionsRemaining,
              sessionsUsed: updatedPkg.sessionsUsed,
              status: updatedPkg.status,
            });
          }
        }
      }

      return {
        sessionId,
        status: 'COMPLETED',
        updatedClients: updatedPackages,
      };
    });

    return NextResponse.json(completionResult);
  } catch (err: any) {
    console.error('Error completing session:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to complete session' },
      { status: 500 }
    );
  }
}
