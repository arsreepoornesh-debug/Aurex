import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Starting AUREX Database Seeding (3 Core Users & Updated Packages)...');

  // 1. Clear existing data
  await prisma.notification.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.expense.deleteMany({});
  await prisma.packageFreeze.deleteMany({});
  await prisma.consent.deleteMany({});
  await prisma.document.deleteMany({});
  await prisma.note.deleteMany({});
  await prisma.followUp.deleteMany({});
  await prisma.attendance.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.assessment.deleteMany({});
  await prisma.clientPackage.deleteMany({});
  await prisma.package.deleteMany({});
  await prisma.client.deleteMany({});
  await prisma.lead.deleteMany({});
  await prisma.specialist.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Create Passwords & Only 3 Users (Owner, Manager, Receptionist)
  const passwordOwner = await bcrypt.hash('AurexOwner@2026', 10);
  const passwordManager = await bcrypt.hash('AurexManager@2026', 10);
  const passwordReceptionist = await bcrypt.hash('AurexRecp@2026', 10);

  const owner = await prisma.user.create({
    data: {
      name: 'Prasan',
      email: 'owner@aurex.com',
      passwordHash: passwordOwner,
      role: 'OWNER',
      phone: '+91 98000 11111',
      active: true,
    },
  });

  const manager = await prisma.user.create({
    data: {
      name: '',
      email: 'manager@aurex.com',
      passwordHash: passwordManager,
      role: 'MANAGER',
      phone: '+91 98000 22222',
      active: true,
    },
  });

  const receptionist = await prisma.user.create({
    data: {
      name: '',
      email: 'receptionist@aurex.com',
      passwordHash: passwordReceptionist,
      role: 'RECEPTIONIST',
      phone: '+91 98000 33333',
      active: true,
    },
  });

  console.log('✅ Created 3 Core Authorized Roles (Owner, Manager, Receptionist)');

  // 3. Create Specialists for Clinical Assignment
  const spec1 = await prisma.specialist.create({
    data: {
      name: 'Dr. Raghav Mehta',
      email: 'raghav.mehta@aurex.com',
      phone: '+91 98111 00001',
      specialization: 'Clinical Exercise Physiologist & Spine Rehab',
      bio: 'Former sports physio with 12+ years experience in lumbar spine biomechanics & functional rehabilitation.',
      colorCode: '#10B981', // Emerald
      active: true,
    },
  });

  const spec2 = await prisma.specialist.create({
    data: {
      name: 'Priya Sharma',
      email: 'priya.sharma@aurex.com',
      phone: '+91 98111 00002',
      specialization: 'Medical Fitness & Post-Cardiac Rehab',
      bio: 'ACSM Certified Clinical Exercise Specialist focused on metabolic conditioning and cardiovascular safety.',
      colorCode: '#3B82F6', // Blue
      active: true,
    },
  });

  const spec3 = await prisma.specialist.create({
    data: {
      name: 'Dr. Arjun Verma',
      email: 'arjun.verma@aurex.com',
      phone: '+91 98111 00003',
      specialization: 'Sports Biomechanics & Knee Joint Mechanics',
      bio: 'Specialist in ACL reconstruction post-rehab and functional hypertrophy.',
      colorCode: '#F59E0B', // Gold
      active: true,
    },
  });

  console.log('✅ Created Specialists');

  // 4. Create Master Packages (Semi-Private ₹12,000, Premium 1:1 ₹12,000, Luxury ₹46,000)
  const pkgSemi = await prisma.package.create({
    data: {
      name: 'Semi-Private Clinical Package (1:4)',
      serviceType: 'SEMI_PRIVATE',
      sessionCount: 12,
      price: 12000,
      validityDays: 60,
      active: true,
    },
  });

  const pkgPrem = await prisma.package.create({
    data: {
      name: 'Premium 1:1 Medical Fitness',
      serviceType: 'PREMIUM',
      sessionCount: 12,
      price: 12000,
      validityDays: 60,
      active: true,
    },
  });

  const pkgLux = await prisma.package.create({
    data: {
      name: 'Luxury Concierge Rehab & Wellness',
      serviceType: 'LUXURY',
      sessionCount: 12,
      price: 46000,
      validityDays: 60,
      active: true,
    },
  });

  console.log('✅ Created Master Packages: Semi-Private (₹12k), Premium 1:1 (₹12k), Luxury (₹46k)');

  // 5. Create Clients with realistic packages, dues, and expiry dates
  const today = new Date();
  const sixtyDaysFromNow = new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000);
  const fourDaysFromNow = new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000);
  const expiredDate = new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000);

  // Client 1: Puneesh (Semi-Private, Fully Paid)
  const puneesh = await prisma.client.create({
    data: {
      clientId: 'AUR-2026-0001',
      name: 'Puneesh',
      phone: '+91 98765 43210',
      email: 'puneesh@example.com',
      dob: new Date('1990-05-15'),
      gender: 'Male',
      address: 'Plot 42, Sector 28, Gurugram',
      emergencyContact: 'Meenakshi',
      emergencyPhone: '+91 98765 00000',
      registrationDate: today,
      referralSource: 'Doctor Referral',
      status: 'ACTIVE',
      category: 'SEMI_PRIVATE',
      assignedSpecialistId: spec1.id,
    },
  });

  const puneeshPackage = await prisma.clientPackage.create({
    data: {
      clientId: puneesh.id,
      packageId: pkgSemi.id,
      name: 'Semi-Private 1:4 Clinical Rehab',
      serviceType: 'SEMI_PRIVATE',
      totalSessions: 12,
      sessionsUsed: 2,
      sessionsRemaining: 10,
      packageAmount: 12000,
      amountPaid: 12000,
      pricePaid: 12000,
      balanceRemaining: 0,
      startDate: today,
      expiryDate: sixtyDaysFromNow,
      status: 'ACTIVE',
    },
  });

  await prisma.payment.create({
    data: {
      clientId: puneesh.id,
      clientPackageId: puneeshPackage.id,
      packageAmount: 12000,
      amountPaid: 12000,
      amount: 12000,
      balanceRemaining: 0,
      paymentDate: today,
      paymentMethod: 'UPI',
      invoiceNumber: 'INV-AUR-2026-0001',
      status: 'PAID',
      notes: 'Full payment via UPI (GPay)',
      createdByUserId: receptionist.id,
    },
  });

  // Client 2: Ananya Roy (Premium 1:1, Has Pending Due Balance)
  const ananya = await prisma.client.create({
    data: {
      clientId: 'AUR-2026-0002',
      name: 'Ananya Roy',
      phone: '+91 98765 43211',
      email: 'ananya.roy@example.com',
      dob: new Date('1988-11-20'),
      gender: 'Female',
      address: 'Tower 4, DLF Phase 5, Gurugram',
      emergencyContact: 'Kunal Roy',
      emergencyPhone: '+91 98765 11111',
      registrationDate: today,
      referralSource: 'Instagram',
      status: 'ACTIVE',
      category: 'PREMIUM',
      assignedSpecialistId: spec2.id,
    },
  });

  const ananyaPackage = await prisma.clientPackage.create({
    data: {
      clientId: ananya.id,
      packageId: pkgPrem.id,
      name: 'Premium 1:1 Medical Fitness',
      serviceType: 'PREMIUM',
      totalSessions: 12,
      sessionsUsed: 1,
      sessionsRemaining: 11,
      packageAmount: 12000,
      amountPaid: 6000,
      pricePaid: 6000,
      balanceRemaining: 6000,
      startDate: today,
      expiryDate: sixtyDaysFromNow,
      status: 'ACTIVE',
    },
  });

  await prisma.payment.create({
    data: {
      clientId: ananya.id,
      clientPackageId: ananyaPackage.id,
      packageAmount: 12000,
      amountPaid: 6000,
      amount: 6000,
      balanceRemaining: 6000,
      paymentDate: today,
      paymentMethod: 'CARD',
      invoiceNumber: 'INV-AUR-2026-0002',
      status: 'PARTIAL',
      notes: 'Part payment - ₹6,000 due next week',
      createdByUserId: receptionist.id,
    },
  });

  // Client 3: Vikram Malhotra (Luxury Concierge, Fully Paid)
  const vikram = await prisma.client.create({
    data: {
      clientId: 'AUR-2026-0003',
      name: 'Vikram Malhotra',
      phone: '+91 98765 43212',
      email: 'vikram.m@example.com',
      dob: new Date('1975-03-10'),
      gender: 'Male',
      address: 'Villa 12, Golf Links, New Delhi',
      emergencyContact: 'Rohit Malhotra',
      emergencyPhone: '+91 98765 22222',
      registrationDate: today,
      referralSource: 'Doctor Referral',
      status: 'ACTIVE',
      category: 'LUXURY',
      assignedSpecialistId: spec1.id,
    },
  });

  const vikramPackage = await prisma.clientPackage.create({
    data: {
      clientId: vikram.id,
      packageId: pkgLux.id,
      name: 'Luxury Concierge Rehab & Wellness',
      serviceType: 'LUXURY',
      totalSessions: 12,
      sessionsUsed: 3,
      sessionsRemaining: 9,
      packageAmount: 46000,
      amountPaid: 46000,
      pricePaid: 46000,
      balanceRemaining: 0,
      startDate: today,
      expiryDate: sixtyDaysFromNow,
      status: 'ACTIVE',
    },
  });

  await prisma.payment.create({
    data: {
      clientId: vikram.id,
      clientPackageId: vikramPackage.id,
      packageAmount: 46000,
      amountPaid: 46000,
      amount: 46000,
      balanceRemaining: 0,
      paymentDate: today,
      paymentMethod: 'BANK_TRANSFER',
      invoiceNumber: 'INV-AUR-2026-0003',
      status: 'PAID',
      notes: 'Full luxury concierge payment via NEFT',
      createdByUserId: manager.id,
    },
  });

  // Client 4: Sneha Reddy (Semi-Private, Expiring Soon with Due Amount)
  const sneha = await prisma.client.create({
    data: {
      clientId: 'AUR-2026-0004',
      name: 'Sneha Reddy',
      phone: '+91 98765 43213',
      email: 'sneha.reddy@example.com',
      dob: new Date('1992-08-25'),
      gender: 'Female',
      address: 'Flat 801, Magnolias, Gurugram',
      emergencyContact: 'Vijay Reddy',
      emergencyPhone: '+91 98765 33333',
      registrationDate: new Date(today.getTime() - 56 * 24 * 60 * 60 * 1000),
      referralSource: 'Website',
      status: 'ACTIVE',
      category: 'SEMI_PRIVATE',
      assignedSpecialistId: spec3.id,
    },
  });

  const snehaPackage = await prisma.clientPackage.create({
    data: {
      clientId: sneha.id,
      packageId: pkgSemi.id,
      name: 'Semi-Private 1:4 Clinical Rehab',
      serviceType: 'SEMI_PRIVATE',
      totalSessions: 12,
      sessionsUsed: 11,
      sessionsRemaining: 1,
      packageAmount: 12000,
      amountPaid: 8000,
      pricePaid: 8000,
      balanceRemaining: 4000,
      startDate: new Date(today.getTime() - 56 * 24 * 60 * 60 * 1000),
      expiryDate: fourDaysFromNow, // Expiring in 4 days!
      status: 'ACTIVE',
    },
  });

  await prisma.payment.create({
    data: {
      clientId: sneha.id,
      clientPackageId: snehaPackage.id,
      packageAmount: 12000,
      amountPaid: 8000,
      amount: 8000,
      balanceRemaining: 4000,
      paymentDate: new Date(today.getTime() - 56 * 24 * 60 * 60 * 1000),
      paymentMethod: 'UPI',
      invoiceNumber: 'INV-AUR-2026-0004',
      status: 'PARTIAL',
      notes: 'Initial deposit - ₹4,000 remaining due',
      createdByUserId: receptionist.id,
    },
  });

  // Client 5: Rajesh Mehra (Luxury, Expired Package)
  const rajesh = await prisma.client.create({
    data: {
      clientId: 'AUR-2026-0005',
      name: 'Rajesh Mehra',
      phone: '+91 98765 43214',
      email: 'rajesh.mehra@example.com',
      dob: new Date('1968-04-12'),
      gender: 'Male',
      address: 'Sector 43, Gurugram',
      emergencyContact: 'Sunita Mehra',
      emergencyPhone: '+91 98765 44444',
      registrationDate: new Date(today.getTime() - 70 * 24 * 60 * 60 * 1000),
      referralSource: 'Walk-in',
      status: 'EXPIRED',
      category: 'LUXURY',
      assignedSpecialistId: spec2.id,
    },
  });

  await prisma.clientPackage.create({
    data: {
      clientId: rajesh.id,
      packageId: pkgLux.id,
      name: 'Luxury Concierge Rehab & Wellness',
      serviceType: 'LUXURY',
      totalSessions: 12,
      sessionsUsed: 12,
      sessionsRemaining: 0,
      packageAmount: 46000,
      amountPaid: 46000,
      pricePaid: 46000,
      balanceRemaining: 0,
      startDate: new Date(today.getTime() - 70 * 24 * 60 * 60 * 1000),
      expiryDate: expiredDate, // Expired 5 days ago!
      status: 'COMPLETED',
    },
  });

  // 6. Create Clinical Sessions and Attendances
  const session8am = await prisma.session.create({
    data: {
      title: 'Morning Clinical Conditioning – Semi-Private',
      date: today,
      startTime: '08:00',
      endTime: '09:00',
      serviceType: 'SEMI_PRIVATE',
      specialistId: spec1.id,
      maxCapacity: 4,
      currentCapacity: 2,
      status: 'CONFIRMED',
      notes: 'Focus on lumbar stabilization & McGill Big 3 prescription.',
    },
  });

  const b1 = await prisma.booking.create({
    data: { sessionId: session8am.id, clientId: puneesh.id, clientPackageId: puneeshPackage.id, status: 'CONFIRMED' },
  });
  const b2 = await prisma.booking.create({
    data: { sessionId: session8am.id, clientId: sneha.id, clientPackageId: snehaPackage.id, status: 'CONFIRMED' },
  });

  await prisma.attendance.create({
    data: {
      bookingId: b1.id,
      sessionId: session8am.id,
      clientId: puneesh.id,
      status: 'PRESENT',
      markedAt: today,
      notes: 'Completed all McGill Big 3 exercises without pain.',
    },
  });

  console.log('✅ Created Seeded Sessions & Client Activities');
  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

