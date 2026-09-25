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

    const documents = await prisma.document.findMany({
      where,
      orderBy: { uploadedAt: 'desc' },
    });

    return NextResponse.json(documents);
  } catch (err: any) {
    console.error('Error fetching documents:', err);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { clientId, type, fileName, filePath, fileSize, accessPermission, notes } = body;

    if (!clientId || !fileName) {
      return NextResponse.json(
        { error: 'Client ID and File Name are required' },
        { status: 400 }
      );
    }

    const currentUserId = (session.user as any).id;

    const document = await prisma.document.create({
      data: {
        clientId,
        type: type || 'MEDICAL_CLEARANCE',
        fileName,
        filePath: filePath || `/uploads/documents/${fileName}`,
        fileSize: Number(fileSize) || 512000,
        accessPermission: accessPermission || 'STAFF_ONLY',
        notes: notes || null,
        uploadedByUserId: currentUserId || null,
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (err: any) {
    console.error('Error creating document record:', err);
    return NextResponse.json({ error: 'Failed to save document' }, { status: 500 });
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
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }

    await prisma.document.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Document removed' });
  } catch (err: any) {
    console.error('Error deleting document:', err);
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
  }
}
