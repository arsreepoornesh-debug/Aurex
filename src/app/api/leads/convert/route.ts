import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateClientId } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { leadId } = body;

    if (!leadId) {
      return NextResponse.json({ error: 'Lead ID is required' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const lead = await tx.lead.findUnique({
        where: { id: leadId },
        include: { followUps: true },
      });

      if (!lead) {
        throw new Error('Lead not found');
      }

      // Count clients for ID generation
      const clientCount = await tx.client.count();
      const clientId = generateClientId(clientCount + 1);

      // Create new client
      const newClient = await tx.client.create({
        data: {
          clientId,
          name: lead.name,
          phone: lead.phone,
          email: lead.email,
          referralSource: lead.source,
          status: 'ACTIVE',
          registrationDate: new Date(),
        },
      });

      // Update lead
      await tx.lead.update({
        where: { id: leadId },
        data: {
          stage: 'CONVERTED',
          convertedClientId: newClient.id,
        },
      });

      // Migrate followups to client record
      if (lead.followUps.length > 0) {
        for (const fu of lead.followUps) {
          await tx.followUp.create({
            data: {
              clientId: newClient.id,
              type: fu.type,
              notes: fu.notes,
              followUpDate: fu.followUpDate,
              completed: fu.completed,
              loggedByUserId: fu.loggedByUserId,
            },
          });
        }
      }

      // Add a note in client history
      await tx.note.create({
        data: {
          clientId: newClient.id,
          category: 'GENERAL',
          content: `Converted from CRM Lead (Source: ${lead.source}). Original notes: ${lead.notes || 'None'}`,
          authorId: (session.user as any).id || null,
        },
      });

      return newClient;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err: any) {
    console.error('Error converting lead to client:', err);
    return NextResponse.json({ error: err.message || 'Failed to convert lead' }, { status: 500 });
  }
}
