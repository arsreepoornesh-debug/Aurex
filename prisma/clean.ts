import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Checking system staff accounts and package catalog...');

  // 1. Ensure RBAC Staff Accounts Exist (Only 3: Owner, Manager, Receptionist)
  const passwordOwner = await bcrypt.hash('AurexOwner@2026', 10);
  const passwordManager = await bcrypt.hash('AurexManager@2026', 10);
  const passwordReceptionist = await bcrypt.hash('AurexRecp@2026', 10);

  // Upsert Owner
  await prisma.user.upsert({
    where: { email: 'owner@aurex.com' },
    update: { name: 'Prasan', passwordHash: passwordOwner, role: 'OWNER', active: true },
    create: {
      name: 'Prasan',
      email: 'owner@aurex.com',
      passwordHash: passwordOwner,
      role: 'OWNER',
      phone: '+91 98000 11111',
      active: true,
    },
  });

  // Upsert Manager
  await prisma.user.upsert({
    where: { email: 'manager@aurex.com' },
    update: { name: '', passwordHash: passwordManager, role: 'MANAGER', active: true },
    create: {
      name: '',
      email: 'manager@aurex.com',
      passwordHash: passwordManager,
      role: 'MANAGER',
      phone: '+91 98000 22222',
      active: true,
    },
  });

  // Upsert Receptionist
  await prisma.user.upsert({
    where: { email: 'receptionist@aurex.com' },
    update: { name: '', passwordHash: passwordReceptionist, role: 'RECEPTIONIST', active: true },
    create: {
      name: '',
      email: 'receptionist@aurex.com',
      passwordHash: passwordReceptionist,
      role: 'RECEPTIONIST',
      phone: '+91 98000 33333',
      active: true,
    },
  });

  console.log('✅ Verified 3 Staff Accounts (Owner, Manager, Receptionist)');

  // 2. Ensure Master Package Catalog exists with correct 3 Tiers
  const semiPkg = await prisma.package.findFirst({ where: { serviceType: 'SEMI_PRIVATE' } });
  if (!semiPkg) {
    await prisma.package.create({
      data: {
        name: 'Semi-Private Clinical Package (1:4)',
        serviceType: 'SEMI_PRIVATE',
        sessionCount: 12,
        price: 12000,
        validityDays: 60,
        active: true,
      },
    });
  }

  const premPkg = await prisma.package.findFirst({ where: { serviceType: 'PREMIUM' } });
  if (!premPkg) {
    await prisma.package.create({
      data: {
        name: 'Premium 1:1 Medical Fitness',
        serviceType: 'PREMIUM',
        sessionCount: 12,
        price: 12000,
        validityDays: 60,
        active: true,
      },
    });
  }

  const luxPkg = await prisma.package.findFirst({ where: { serviceType: 'LUXURY' } });
  if (!luxPkg) {
    await prisma.package.create({
      data: {
        name: 'Luxury Concierge Rehab & Wellness',
        serviceType: 'LUXURY',
        sessionCount: 12,
        price: 46000,
        validityDays: 60,
        active: true,
      },
    });
  }

  // 3. Ensure Specialists exist
  const existingSpecs = await prisma.specialist.count();
  if (existingSpecs === 0) {
    await prisma.specialist.createMany({
      data: [
        {
          name: 'Dr. Raghav Mehta',
          email: 'raghav.mehta@aurex.com',
          phone: '+91 98111 00001',
          specialization: 'Clinical Exercise Physiologist & Spine Rehab',
          bio: 'Former sports physio with 12+ years experience in lumbar spine biomechanics & functional rehabilitation.',
          colorCode: '#10B981',
          active: true,
        },
        {
          name: 'Priya Sharma',
          email: 'priya.sharma@aurex.com',
          phone: '+91 98111 00002',
          specialization: 'Medical Fitness & Post-Cardiac Rehab',
          bio: 'ACSM Certified Clinical Exercise Specialist focused on metabolic conditioning and cardiovascular safety.',
          colorCode: '#3B82F6',
          active: true,
        },
        {
          name: 'Dr. Arjun Verma',
          email: 'arjun.verma@aurex.com',
          phone: '+91 98111 00003',
          specialization: 'Sports Biomechanics & Knee Joint Mechanics',
          bio: 'Specialist in ACL reconstruction post-rehab and functional hypertrophy.',
          colorCode: '#F59E0B',
          active: true,
        },
      ],
    });
  }

  console.log('✅ System initialization complete.');
}

main()
  .catch((e) => {
    console.error('❌ Error during system verification:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
