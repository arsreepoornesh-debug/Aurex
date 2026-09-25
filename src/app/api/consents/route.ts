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

    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get('clientId');

    const where: any = {};
    if (clientId) {
      where.clientId = clientId;
    }

    const consents = await prisma.consent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(consents);
  } catch (err: any) {
    console.error('Error fetching consents:', err);
    return NextResponse.json({ error: 'Failed to fetch consents' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { clientId, consentVersion, consentText, digitalSignature, acknowledgedBy } = body;

    if (!clientId || !consentText) {
      return NextResponse.json(
        { error: 'Client ID and Consent Text are required' },
        { status: 400 }
      );
    }

    const ipAddress = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const staffName = acknowledgedBy || (session.user as any).name || 'Staff Witness';

    const consent = await prisma.consent.create({
      data: {
        clientId,
        consentVersion: consentVersion || 'v1.0',
        consentText,
        status: 'SIGNED',
        acknowledgedAt: new Date(),
        acknowledgedBy: staffName,
        ipAddress,
        digitalSignature: digitalSignature || null,
      },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id || null,
        action: 'SIGN_CONSENT',
        entity: 'Consent',
        entityId: consent.id,
        details: JSON.stringify({ clientId, version: consent.consentVersion, staff: staffName }),
        ipAddress,
      },
    });

    return NextResponse.json(consent, { status: 201 });
  } catch (err: any) {
    console.error('Error creating consent record:', err);
    return NextResponse.json({ error: 'Failed to record consent' }, { status: 500 });
  }
}
