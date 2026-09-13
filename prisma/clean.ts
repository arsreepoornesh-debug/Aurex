import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Wiping all transactional & client data for fresh start...');

  // 1. Delete all transactional data
  await prisma.attendance.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.assessment.deleteMany({});
  await prisma.note.deleteMany({});
  await prisma.followUp.deleteMany({});
  await prisma.clientPackage.deleteMany({});
  await prisma.client.deleteMany({});
  await prisma.lead.deleteMany({});
  await prisma.expense.deleteMany({});

  console.log('✅ Wiped all Clients, Bookings, Sessions, Payments, Leads, Assessments, and Expenses.');

  // 2. Ensure RBAC Staff Accounts Exist
  const passwordOwner = await bcrypt.hash('AurexOwner@2026', 10);
  const passwordManager = await bcrypt.hash('AurexManager@2026', 10);
  const passwordReceptionist = await bcrypt.hash('AurexRecp@2026', 10);

  // Upsert Owner
  await prisma.user.upsert({
    where: { email: 'owner@aurex.com' },
    update: { passwordHash: passwordOwner, role: 'OWNER', active: true },
    create: {
      name: 'Dr. Siddharth Rao (Owner)',
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
    update: { passwordHash: passwordManager, role: 'MANAGER', active: true },
    create: {
      name: 'Kavita Iyer (Manager)',
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
    update: { passwordHash: passwordReceptionist, role: 'RECEPTIONIST', active: true },
    create: {
      name: 'Rohan Deshmukh (Receptionist)',
      email: 'receptionist@aurex.com',
      passwordHash: passwordReceptionist,
      role: 'RECEPTIONIST',
      phone: '+91 98000 33333',
      active: true,
    },
  });

  console.log('✅ Verified Staff Accounts (Owner, Manager, Receptionist)');

  // 3. Ensure Master Package Catalog exists
  const existingPkgs = await prisma.package.count();
  if (existingPkgs === 0) {
    await prisma.package.createMany({
      data: [
        {
          name: 'Semi-Private Clinical Package (12 Sessions)',
          serviceType: 'SEMI_PRIVATE',
          sessionCount: 12,
          price: 24000,
          validityDays: 60,
          active: true,
        },
        {
          name: 'Semi-Private Clinical Package (24 Sessions)',
          serviceType: 'SEMI_PRIVATE',
          sessionCount: 24,
          price: 42000,
          validityDays: 120,
          active: true,
        },
        {
          name: 'Premium 1:1 Medical Fitness (12 Sessions)',
          serviceType: 'PREMIUM',
          sessionCount: 12,
          price: 48000,
          validityDays: 60,
          active: true,
        },
        {
          name: 'Initial Clinical Assessment & Biomechanical Screening',
          serviceType: 'ASSESSMENT',
          sessionCount: 1,
          price: 3500,
          validityDays: 30,
          active: true,
        },
      ],
    });
    console.log('✅ Created Master Package Catalog');
  }

  // 4. Ensure Specialists exist
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
    console.log('✅ Created Specialists');
  }

  console.log('✨ Fresh database ready with 0 clients, 0 leads, 0 bookings, 0 payments!');
}

main()
  .catch((e) => {
    console.error('❌ Error during database clean:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
