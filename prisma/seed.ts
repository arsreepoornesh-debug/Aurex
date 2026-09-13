import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting AUREX Database Seeding...');

  // 1. Clear existing data
  await prisma.attendance.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.assessment.deleteMany({});
  await prisma.note.deleteMany({});
  await prisma.followUp.deleteMany({});
  await prisma.clientPackage.deleteMany({});
  await prisma.package.deleteMany({});
  await prisma.client.deleteMany({});
  await prisma.lead.deleteMany({});
  await prisma.specialist.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Create Users (RBAC)
  const passwordOwner = await bcrypt.hash('AurexOwner@2026', 10);
  const passwordManager = await bcrypt.hash('AurexManager@2026', 10);
  const passwordReceptionist = await bcrypt.hash('AurexRecp@2026', 10);

  const owner = await prisma.user.create({
    data: {
      name: 'Dr. Siddharth Rao (Owner)',
      email: 'owner@aurex.com',
      passwordHash: passwordOwner,
      role: 'OWNER',
      phone: '+91 98000 11111',
      active: true,
    },
  });

  const manager = await prisma.user.create({
    data: {
      name: 'Kavita Iyer (Manager)',
      email: 'manager@aurex.com',
      passwordHash: passwordManager,
      role: 'MANAGER',
      phone: '+91 98000 22222',
      active: true,
    },
  });

  const receptionist = await prisma.user.create({
    data: {
      name: 'Rohan Deshmukh (Receptionist)',
      email: 'receptionist@aurex.com',
      passwordHash: passwordReceptionist,
      role: 'RECEPTIONIST',
      phone: '+91 98000 33333',
      active: true,
    },
  });

  console.log('✅ Created 3 RBAC Staff accounts (Owner, Manager, Receptionist)');

  // 3. Create Specialists
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

  console.log('✅ Created 3 Specialists');

  // 4. Create Master Packages
  const pkgSemi12 = await prisma.package.create({
    data: {
      name: 'Semi-Private Clinical Package (12 Sessions)',
      serviceType: 'SEMI_PRIVATE',
      sessionCount: 12,
      price: 24000,
      validityDays: 60,
      active: true,
    },
  });

  const pkgSemi24 = await prisma.package.create({
    data: {
      name: 'Semi-Private Clinical Package (24 Sessions)',
      serviceType: 'SEMI_PRIVATE',
      sessionCount: 24,
      price: 42000,
      validityDays: 120,
      active: true,
    },
  });

  const pkgPrem12 = await prisma.package.create({
    data: {
      name: 'Premium 1:1 Medical Fitness (12 Sessions)',
      serviceType: 'PREMIUM',
      sessionCount: 12,
      price: 48000,
      validityDays: 60,
      active: true,
    },
  });

  const pkgAssess = await prisma.package.create({
    data: {
      name: 'Initial Clinical Assessment & Biomechanical Screening',
      serviceType: 'ASSESSMENT',
      sessionCount: 1,
      price: 3500,
      validityDays: 30,
      active: true,
    },
  });

  console.log('✅ Created Master Package Catalog');

  // 5. Create Clients
  const today = new Date();
  const sixtyDaysFromNow = new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000);
  const fiveDaysFromNow = new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000);

  // Client 1: Puneesh (Target of Critical Test Case)
  const puneesh = await prisma.client.create({
    data: {
      clientId: 'AUR-2026-0001',
      name: 'Puneesh',
      phone: '+91 98765 43210',
      email: 'puneesh@example.com',
      dob: new Date('1990-05-15'),
      gender: 'Male',
      address: 'Plot 42, Sector 28, Gurugram, Haryana',
      emergencyContactName: 'Meenakshi (Spouse)',
      emergencyContactPhone: '+91 98765 00000',
      registrationDate: today,
      referralSource: 'Doctor Referral',
      status: 'ACTIVE',
      assignedSpecialistId: spec1.id,
    },
  });

  // Client 2: Ananya Roy
  const ananya = await prisma.client.create({
    data: {
      clientId: 'AUR-2026-0002',
      name: 'Ananya Roy',
      phone: '+91 98111 22334',
      email: 'ananya.roy@example.com',
      dob: new Date('1988-11-20'),
      gender: 'Female',
      address: 'Tower 4, DLF Phase 5, Gurugram',
      emergencyContactName: 'Kunal Roy',
      emergencyContactPhone: '+91 98111 99999',
      registrationDate: today,
      referralSource: 'Instagram',
      status: 'ACTIVE',
      assignedSpecialistId: spec1.id,
    },
  });

  // Client 3: Vikram Malhotra
  const vikram = await prisma.client.create({
    data: {
      clientId: 'AUR-2026-0003',
      name: 'Vikram Malhotra',
      phone: '+91 97222 33445',
      email: 'vikram.m@example.com',
      dob: new Date('1982-03-10'),
      gender: 'Male',
      address: 'Villa 12, Nirvana Country, Gurugram',
      registrationDate: today,
      referralSource: 'Google',
      status: 'ACTIVE',
      assignedSpecialistId: spec1.id,
    },
  });

  // Client 4: Sneha Patel (Near Expiry for alert testing)
  const sneha = await prisma.client.create({
    data: {
      clientId: 'AUR-2026-0004',
      name: 'Sneha Patel',
      phone: '+91 96333 44556',
      email: 'sneha.patel@example.com',
      dob: new Date('1995-08-25'),
      gender: 'Female',
      address: 'Golf Course Road, Gurugram',
      registrationDate: new Date(today.getTime() - 45 * 24 * 60 * 60 * 1000),
      referralSource: 'WhatsApp',
      status: 'ACTIVE',
      assignedSpecialistId: spec2.id,
    },
  });

  console.log('✅ Created 4 Clients (including Puneesh AUR-2026-0001)');

  // 6. Assign Initial Assessment for Puneesh
  await prisma.assessment.create({
    data: {
      clientId: puneesh.id,
      specialistId: spec1.id,
      type: 'INITIAL',
      date: today,
      healthScreening: JSON.stringify({
        parQAnswer: 'NO',
        medicalConditions: ['L4-L5 Lumbar Disc Bulge', 'Mild Postural Kyphosis'],
        redFlags: ['No radicular pain down lower extremity'],
        physicianClearanceRequired: true,
        physicianClearanceObtained: true,
      }),
      medicalHistory: JSON.stringify({
        surgeries: 'None',
        injuries: 'Low back strain 6 months ago during deadlift',
        currentMedications: 'Occasional NSAIDs as needed',
        painAreas: ['Lower Back (Lumbosacral)'],
      }),
      goals: JSON.stringify({
        primaryGoal: 'Core stabilization, pain-free posture & return to recreational sports',
        secondaryGoals: ['Hamstring flexibility', 'Glute reactivation', 'Spinal decompression'],
        timelineWeeks: 12,
        sportsOrActivities: 'Swimming, Badminton',
      }),
      baselineMetrics: JSON.stringify({
        heightCm: 178,
        weightKg: 82,
        bmi: 25.9,
        restingHeartRate: 72,
        bloodPressureSystolic: 122,
        bloodPressureDiastolic: 78,
        bodyFatPercent: 21.5,
        spo2: 99,
      }),
      functionalMovement: JSON.stringify({
        overheadSquatScore: 2,
        hurdleStepScore: 2,
        shoulderMobilityScore: 3,
        activeStraightLegRaise: 2,
        trunkStabilityPushup: 2,
        rotaryStabilityScore: 2,
        postureNotes: 'Anterior pelvic tilt with tight hip flexors and weak transverse abdominis.',
      }),
      cardioStrength: JSON.stringify({
        submaxCardioTest: 'YMCA 3-minute step test (Good recovery)',
        estimatedVo2Max: 38.5,
        gripStrengthKg: 46,
        pushupCount: 22,
        plankHoldSeconds: 55,
      }),
      clinicalNotes: JSON.stringify({
        findings: 'Mechanical low back pain secondary to core deconditioning and anterior pelvic tilt.',
        exercisePrescription: 'McGill Big 3 (Bird-Dog, Side Plank, Modified Curl-up), Glute Bridges, Goblet Squats with neutral spine.',
        contraindications: 'Avoid loaded spinal flexion and extreme lumbar rotational twists.',
        nextReviewDate: '6 Weeks',
      }),
    },
  });

  // Assign Package to Puneesh: Semi-Private 12 Sessions
  const puneeshPackage = await prisma.clientPackage.create({
    data: {
      clientId: puneesh.id,
      packageId: pkgSemi12.id,
      name: pkgSemi12.name,
      serviceType: 'SEMI_PRIVATE',
      totalSessions: 12,
      sessionsUsed: 0,
      sessionsRemaining: 12,
      pricePaid: 24000,
      balanceRemaining: 0,
      startDate: today,
      expiryDate: sixtyDaysFromNow,
      status: 'ACTIVE',
    },
  });

  // Record Payment for Puneesh
  await prisma.payment.create({
    data: {
      clientId: puneesh.id,
      clientPackageId: puneeshPackage.id,
      amount: 24000,
      balanceRemaining: 0,
      paymentDate: today,
      paymentMethod: 'UPI',
      invoiceNumber: 'INV-AUR-2026-0001',
      status: 'PAID',
      notes: 'Initial 12-Session Semi-Private payment via UPI Ref: 4892749219',
    },
  });

  // Sneha Package (Expiring soon with 2 sessions remaining to test renewal flags)
  const snehaPackage = await prisma.clientPackage.create({
    data: {
      clientId: sneha.id,
      packageId: pkgSemi12.id,
      name: pkgSemi12.name,
      serviceType: 'SEMI_PRIVATE',
      totalSessions: 12,
      sessionsUsed: 10,
      sessionsRemaining: 2,
      pricePaid: 24000,
      balanceRemaining: 0,
      startDate: new Date(today.getTime() - 55 * 24 * 60 * 60 * 1000),
      expiryDate: fiveDaysFromNow,
      status: 'ACTIVE',
    },
  });

  // 7. Create Today's Sessions & Slots
  // Slot 1: 8:00 AM - 9:00 AM Semi-Private (Dr. Raghav Mehta)
  const session8am = await prisma.session.create({
    data: {
      title: 'Morning Clinical Conditioning — Semi-Private',
      date: today,
      startTime: '08:00',
      endTime: '09:00',
      serviceType: 'SEMI_PRIVATE',
      specialistId: spec1.id,
      maxCapacity: 4,
      currentCapacity: 1,
      status: 'CONFIRMED',
      notes: 'Focus on lumbar stabilization & hip mobility.',
    },
  });

  // Book Puneesh into 8:00 AM session
  const bookingPuneesh = await prisma.booking.create({
    data: {
      sessionId: session8am.id,
      clientId: puneesh.id,
      clientPackageId: puneeshPackage.id,
      status: 'CONFIRMED',
    },
  });

  await prisma.attendance.create({
    data: {
      bookingId: bookingPuneesh.id,
      sessionId: session8am.id,
      clientId: puneesh.id,
      status: 'PENDING',
    },
  });

  // Slot 2: 9:00 AM - 10:00 AM Premium 1:1 (Priya Sharma)
  const session9am = await prisma.session.create({
    data: {
      title: 'Post-Cardiac Rehab 1:1 — Premium',
      date: today,
      startTime: '09:00',
      endTime: '10:00',
      serviceType: 'PREMIUM',
      specialistId: spec2.id,
      maxCapacity: 1,
      currentCapacity: 1,
      status: 'CONFIRMED',
    },
  });

  const snehaBooking = await prisma.booking.create({
    data: {
      sessionId: session9am.id,
      clientId: sneha.id,
      clientPackageId: snehaPackage.id,
      status: 'CONFIRMED',
    },
  });

  await prisma.attendance.create({
    data: {
      bookingId: snehaBooking.id,
      sessionId: session9am.id,
      clientId: sneha.id,
      status: 'PENDING',
    },
  });

  // Slot 3: 10:00 AM - 11:00 AM Semi-Private (Dr. Arjun Verma) - empty slot for testing
  await prisma.session.create({
    data: {
      title: 'Lower Limb Biomechanics & Knee Rehab — Semi-Private',
      date: today,
      startTime: '10:00',
      endTime: '11:00',
      serviceType: 'SEMI_PRIVATE',
      specialistId: spec3.id,
      maxCapacity: 4,
      currentCapacity: 0,
      status: 'CONFIRMED',
    },
  });

  // 8. Create Leads for CRM
  const sampleLeads = [
    { name: 'sarb', phone: '8874402300', source: 'Portal Form', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
    { name: 'SIMRAN', phone: '6280755152', source: 'Instagram', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
    { name: 'Kanika', phone: '8699288803', source: 'Google', date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
    { name: 'Anchal', phone: '6834575420', source: 'WhatsApp', date: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000) },
    { name: 'Kanika', phone: '8699288803', source: 'Referral', date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) },
    { name: 'Rajat Kapoor', phone: '9910088776', source: 'Instagram', date: today },
    { name: 'Divya Nambiar', phone: '9920077665', source: 'Google', date: today },
    { name: 'Manish Gupta', phone: '9930066554', source: 'Referral', date: today },
    { name: 'Aarav Mehta', phone: '9845011223', source: 'Website', date: today },
    { name: 'Ritu Sen', phone: '9871122334', source: 'Walk-in', date: today },
    { name: 'Vikrant Saxena', phone: '9711099887', source: 'Instagram', date: today },
    { name: 'Tanvi Joshi', phone: '9820033445', source: 'Doctor Referral', date: today },
    { name: 'Siddharth Nair', phone: '9940022331', source: 'Google', date: today },
    { name: 'Deepa Menon', phone: '9810055443', source: 'WhatsApp', date: today },
    { name: 'Gaurav Bhasin', phone: '9765412345', source: 'Facebook', date: today },
    { name: 'Natasha Paul', phone: '9988776655', source: 'Website', date: today },
  ];

  for (const l of sampleLeads) {
    await prisma.lead.create({
      data: {
        name: l.name,
        phone: l.phone,
        source: l.source,
        stage: 'NEW_LEAD',
        createdAt: l.date,
        notes: 'Inquiry received via portal / campaign channel.',
      },
    });
  }

  console.log('✅ Created CRM Leads');
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
