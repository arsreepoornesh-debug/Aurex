import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return handleSync(req);
}

export async function POST(req: NextRequest) {
  return handleSync(req);
}

async function handleSync(req: NextRequest) {
  try {
    const passwordOwner = await bcrypt.hash('AurexOwner@2026', 10);
    const passwordManager = await bcrypt.hash('AurexManager@2026', 10);
    const passwordReceptionist = await bcrypt.hash('AurexRecp@2026', 10);

    // 1. Upsert Owner (Prasan)
    await prisma.user.upsert({
      where: { email: 'owner@aurex.com' },
      update: { 
        name: 'Prasan', 
        passwordHash: passwordOwner, 
        role: 'OWNER', 
        active: true 
      },
      create: {
        name: 'Prasan',
        email: 'owner@aurex.com',
        passwordHash: passwordOwner,
        role: 'OWNER',
        phone: '+91 98000 11111',
        active: true,
      },
    });

    // 2. Upsert Manager
    await prisma.user.upsert({
      where: { email: 'manager@aurex.com' },
      update: { 
        name: '', 
        passwordHash: passwordManager, 
        role: 'MANAGER', 
        active: true 
      },
      create: {
        name: '',
        email: 'manager@aurex.com',
        passwordHash: passwordManager,
        role: 'MANAGER',
        phone: '+91 98000 22222',
        active: true,
      },
    });

    // 3. Upsert Receptionist
    await prisma.user.upsert({
      where: { email: 'receptionist@aurex.com' },
      update: { 
        name: '', 
        passwordHash: passwordReceptionist, 
        role: 'RECEPTIONIST', 
        active: true 
      },
      create: {
        name: '',
        email: 'receptionist@aurex.com',
        passwordHash: passwordReceptionist,
        role: 'RECEPTIONIST',
        phone: '+91 98000 33333',
        active: true,
      },
    });

    const users = await prisma.user.findMany({
      where: {
        email: { in: ['owner@aurex.com', 'manager@aurex.com', 'receptionist@aurex.com'] }
      },
      select: { email: true, name: true, role: true, active: true }
    });

    return NextResponse.json({
      success: true,
      message: 'All 3 staff accounts synchronized successfully',
      credentials: [
        { role: 'OWNER', name: 'Prasan', email: 'owner@aurex.com', password: 'AurexOwner@2026' },
        { role: 'MANAGER', name: '', email: 'manager@aurex.com', password: 'AurexManager@2026' },
        { role: 'RECEPTIONIST', name: '', email: 'receptionist@aurex.com', password: 'AurexRecp@2026' },
      ],
      users,
    });
  } catch (err: any) {
    console.error('Error in /api/sync-users:', err);
    return NextResponse.json({ error: 'Failed to sync users', details: err.message }, { status: 500 });
  }
}
