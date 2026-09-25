import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateClientId } from '@/lib/clientId';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const leadId = params.id;
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        followUps: true,
      },
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    if (lead.convertedClientId) {
      return NextResponse.json(
        { error: 'Lead has already been converted to a client' },
        { status: 400 }
      );
    }

    // Auto-generate next Client ID formatted as AUR-YYYY-XXXX
    const newClientId = await generateClientId();

    const clientName = lead.name || `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || 'Valued Client';

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create client record
      const client = await tx.client.create({
        data: {
          clientId: newClientId,
          name: clientName,
          phone: lead.phone,
          email: lead.email || null,
          gender: lead.gender || 'Male',
          dob: lead.dob || null,
          registrationDate: new Date(),
          referralSource: lead.source || 'Walk-in',
          status: 'ACTIVE',
        },
      });

      // 2. Mark lead as converted/joined and link client
      await tx.lead.update({
        where: { id: leadId },
        data: {
          stage: 'JOINED',
          convertedClientId: client.id,
        },
      });

      // 3. Migrate follow-ups from lead to client
      for (const fu of lead.followUps) {
        await tx.followUp.update({
          where: { id: fu.id },
          data: {
            clientId: client.id,
          },
        });
      }

      // 4. Create initial note on client profile
      await tx.note.create({
        data: {
          clientId: client.id,
          content: `Converted from CRM Lead (Source: ${lead.source || 'Direct'}, Stage: ${lead.stage}). Notes: ${lead.notes || 'None'}`,
          category: 'GENERAL',
          authorId: (session.user as any).id || null,
        },
      });

      return client;
    });

    return NextResponse.json({
      success: true,
      message: `Lead successfully converted to Client ${result.name} (${result.clientId})`,
      client: result,
    }, { status: 201 });
  } catch (err: any) {
    console.error('Error converting lead to client:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to convert lead to client' },
      { status: 500 }
    );
  }
}
