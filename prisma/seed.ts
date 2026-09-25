import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting AUREX Database Seeding...');

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

  // 2. Create Passwords & Users (RBAC)
  const passwordOwner = await bcrypt.hash('AurexOwner@2026', 10);
  const passwordManager = await bcrypt.hash('AurexManager@2026', 10);
  const passwordReceptionist = await bcrypt.hash('AurexRecp@2026', 10);
  const passwordSpecialist = await bcrypt.hash('AurexSpec@2026', 10);
  const passwordClient = await bcrypt.hash('AurexClient@2026', 10);

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

  const specialistUser = await prisma.user.create({
    data: {
      name: 'Dr. Raghav Mehta (Specialist)',
      email: 'specialist@aurex.com',
      passwordHash: passwordSpecialist,
      role: 'SPECIALIST',
      phone: '+91 98111 00001',
      active: true,
    },
  });

  console.log('✅ Created Core Staff accounts (Owner, Manager, Receptionist, Specialist)');

  // 3. Create Specialists
  const spec1 = await prisma.specialist.create({
    data: {
      name: 'Dr. Raghav Mehta',
      email: 'raghav.mehta@aurex.com',
      phone: '+91 98111 00001',
      specialization: 'Clinical Exercise Physiologist & Spine Rehab',
      bio: 'Former sports physio with 12+ years experience in lumbar spine biomechanics & functional rehabilitation.',
      colorCode: '#10B981', // Emerald
      userId: specialistUser.id,
      active: true,
    },
  });

  // Update specialistUser with specialistId
  await prisma.user.update({
    where: { id: specialistUser.id },
    data: { specialistId: spec1.id },
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
      validityDays: 90,
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
      validityDays: 90,
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
  const ninetyDaysFromNow = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);
  const fiveDaysFromNow = new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000);

  // Client 1: Puneesh (Target of Critical Test Case & Client Portal Test User)
  const puneesh = await prisma.client.create({
    data: {
      clientId: 'AUR-2026-0001',
      name: 'Puneesh',
      phone: '+91 98765 43210',
      email: 'client@aurex.com',
      dob: new Date('1990-05-15'),
      gender: 'Male',
      address: 'Plot 42, Sector 28, Gurugram, Haryana',
      emergencyContact: 'Meenakshi (Spouse)',
      emergencyPhone: '+91 98765 00000',
      registrationDate: today,
      referralSource: 'Doctor Referral',
      status: 'ACTIVE',
      assignedSpecialistId: spec1.id,
    },
  });

  // Client User account for Puneesh
  const clientUser = await prisma.user.create({
    data: {
      name: 'Puneesh (Client)',
      email: 'client@aurex.com',
      passwordHash: passwordClient,
      role: 'CLIENT',
      phone: '+91 98765 43210',
      active: true,
      clientId: puneesh.id,
    },
  });

  await prisma.client.update({
    where: { id: puneesh.id },
    data: { userId: clientUser.id },
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
      emergencyContact: 'Kunal Roy',
      emergencyPhone: '+91 98111 99999',
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

  // Client 4: Sneha Patel (Near Expiry with 2 sessions remaining to test renewal flags)
  const sneha = await prisma.client.create({
    data: {
      clientId: 'AUR-2026-0004',
      name: 'Sneha Patel',
      phone: '+91 96333 44556',
      email: 'sneha.patel@example.com',
      dob: new Date('1995-08-25'),
      gender: 'Female',
      address: 'Golf Course Road, Gurugram',
      registrationDate: new Date(today.getTime() - 55 * 24 * 60 * 60 * 1000),
      referralSource: 'WhatsApp',
      status: 'ACTIVE',
      assignedSpecialistId: spec2.id,
    },
  });

  // Client 5: Rajesh Khanna (Irregular client for testing 7+ days threshold)
  const rajesh = await prisma.client.create({
    data: {
      clientId: 'AUR-2026-0005',
      name: 'Rajesh Khanna',
      phone: '+91 95444 33221',
      email: 'rajesh.k@example.com',
      dob: new Date('1976-02-14'),
      gender: 'Male',
      address: 'South City 1, Gurugram',
      registrationDate: new Date(today.getTime() - 80 * 24 * 60 * 60 * 1000),
      referralSource: 'Walk-in',
      status: 'ACTIVE',
      assignedSpecialistId: spec3.id,
    },
  });

  console.log('✅ Created 5 Clients (including Puneesh AUR-2026-0001 with Client Portal link)');

  // 6. Assign Initial Assessment for Puneesh with McGill Big 3
  await prisma.assessment.create({
    data: {
      clientId: puneesh.id,
      specialistId: spec1.id,
      type: 'INITIAL',
      assessmentDate: today,
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
      goals: 'Core stabilization, pain-free posture & return to recreational sports (Swimming, Badminton)',
      baselineMetrics: JSON.stringify({
        heightCm: 178,
        weightKg: 82,
        bmi: 25.9,
        restingHeartRate: 72,
        bloodPressureSystolic: 122,
        bloodPressureDiastolic: 78,
        bodyFatPercent: 21.5,
        spo2: 99,
        waistCircumferenceCm: 88,
        hipCircumferenceCm: 102,
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
      strengthAssessment: JSON.stringify({
        mcGillBig3: {
          modifiedCurlUp: 'Hold 10s x 5 reps (Good endurance)',
          sideBridgeLeft: 'Hold 45s (Mild asymmetry)',
          sideBridgeRight: 'Hold 52s',
          birdDog: 'Hold 10s x 6 reps (Excellent spinal stability)',
        },
        gripStrengthKg: 46,
        pushupCount: 22,
        plankHoldSeconds: 55,
      }),
      cardiovascularData: JSON.stringify({
        submaxCardioTest: 'YMCA 3-minute step test (Good recovery)',
        estimatedVo2Max: 38.5,
        restingHeartRate: 72,
        fitnessCategory: 'Good / Moderate Active',
      }),
      clinicalNotes: 'Mechanical low back pain secondary to core deconditioning and anterior pelvic tilt. Exercise Prescription: McGill Big 3 (Bird-Dog, Side Plank, Modified Curl-up), Glute Bridges, Neutral Spine Goblet Squats. Contraindications: Avoid loaded spinal flexion and rotational twists under load.',
    },
  });

  // Assign Package to Puneesh: Semi-Private 12 Sessions (1 session already completed, 11 remaining)
  const puneeshPackage = await prisma.clientPackage.create({
    data: {
      clientId: puneesh.id,
      packageId: pkgSemi12.id,
      name: pkgSemi12.name,
      serviceType: 'SEMI_PRIVATE',
      totalSessions: 12,
      sessionsUsed: 1,
      sessionsRemaining: 11,
      packageAmount: 24000,
      amountPaid: 24000,
      balanceRemaining: 0,
      startDate: today,
      expiryDate: ninetyDaysFromNow,
      status: 'ACTIVE',
    },
  });

  // Record Payment for Puneesh
  await prisma.payment.create({
    data: {
      clientId: puneesh.id,
      clientPackageId: puneeshPackage.id,
      packageAmount: 24000,
      amountPaid: 24000,
      balanceRemaining: 0,
      paymentDate: today,
      paymentMethod: 'UPI',
      invoiceNumber: 'INV-AUR-2026-0001',
      status: 'PAID',
      notes: 'Initial 12-Session Semi-Private package payment via UPI Ref: 4892749219',
      createdByUserId: owner.id,
    },
  });

  // Assign Packages to other clients
  const ananyaPackage = await prisma.clientPackage.create({
    data: {
      clientId: ananya.id,
      packageId: pkgSemi12.id,
      name: pkgSemi12.name,
      serviceType: 'SEMI_PRIVATE',
      totalSessions: 12,
      sessionsUsed: 2,
      sessionsRemaining: 10,
      packageAmount: 24000,
      amountPaid: 24000,
      balanceRemaining: 0,
      startDate: today,
      expiryDate: ninetyDaysFromNow,
      status: 'ACTIVE',
    },
  });

  const vikramPackage = await prisma.clientPackage.create({
    data: {
      clientId: vikram.id,
      packageId: pkgSemi12.id,
      name: pkgSemi12.name,
      serviceType: 'SEMI_PRIVATE',
      totalSessions: 12,
      sessionsUsed: 0,
      sessionsRemaining: 12,
      packageAmount: 24000,
      amountPaid: 24000,
      balanceRemaining: 0,
      startDate: today,
      expiryDate: ninetyDaysFromNow,
      status: 'ACTIVE',
    },
  });

  // Sneha Package (Expiring soon with 2 sessions remaining)
  const snehaPackage = await prisma.clientPackage.create({
    data: {
      clientId: sneha.id,
      packageId: pkgSemi12.id,
      name: pkgSemi12.name,
      serviceType: 'SEMI_PRIVATE',
      totalSessions: 12,
      sessionsUsed: 10,
      sessionsRemaining: 2,
      packageAmount: 24000,
      amountPaid: 24000,
      balanceRemaining: 0,
      startDate: new Date(today.getTime() - 55 * 24 * 60 * 60 * 1000),
      expiryDate: fiveDaysFromNow,
      status: 'ACTIVE',
    },
  });

  // Rajesh Package (Irregular, 6 sessions remaining)
  await prisma.clientPackage.create({
    data: {
      clientId: rajesh.id,
      packageId: pkgSemi12.id,
      name: pkgSemi12.name,
      serviceType: 'SEMI_PRIVATE',
      totalSessions: 12,
      sessionsUsed: 6,
      sessionsRemaining: 6,
      packageAmount: 24000,
      amountPaid: 24000,
      balanceRemaining: 0,
      startDate: new Date(today.getTime() - 75 * 24 * 60 * 60 * 1000),
      expiryDate: new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000),
      status: 'ACTIVE',
    },
  });

  // 7. Create Today's Sessions & Slots for Dashboard & Utilisation
  // Slot 1: 7:00 AM - 8:00 AM Semi-Private (4/4 FULL -> 100% Red)
  const session7am = await prisma.session.create({
    data: {
      title: 'Dawn Clinical Conditioning — Semi-Private',
      date: today,
      startTime: '07:00',
      endTime: '08:00',
      serviceType: 'SEMI_PRIVATE',
      specialistId: spec1.id,
      maxCapacity: 4,
      currentCapacity: 4,
      status: 'CONFIRMED',
      notes: 'Active recovery and spinal warmups.',
    },
  });

  // Slot 2: 8:00 AM - 9:00 AM Semi-Private (4/4 FULL -> 75% or 100% target test slot)
  const session8am = await prisma.session.create({
    data: {
      title: 'Morning Clinical Conditioning — Semi-Private',
      date: today,
      startTime: '08:00',
      endTime: '09:00',
      serviceType: 'SEMI_PRIVATE',
      specialistId: spec1.id,
      maxCapacity: 4,
      currentCapacity: 4,
      status: 'CONFIRMED',
      notes: 'Focus on lumbar stabilization & McGill Big 3 prescription.',
    },
  });

  // Book 4 clients into 8:00 AM session (Puneesh, Ananya, Vikram, Sneha) -> 4/4 FULL
  const b1 = await prisma.booking.create({
    data: { sessionId: session8am.id, clientId: puneesh.id, clientPackageId: puneeshPackage.id, status: 'CONFIRMED' },
  });
  const b2 = await prisma.booking.create({
    data: { sessionId: session8am.id, clientId: ananya.id, clientPackageId: ananyaPackage.id, status: 'CONFIRMED' },
  });
  const b3 = await prisma.booking.create({
    data: { sessionId: session8am.id, clientId: vikram.id, clientPackageId: vikramPackage.id, status: 'CONFIRMED' },
  });
  const b4 = await prisma.booking.create({
    data: { sessionId: session8am.id, clientId: sneha.id, clientPackageId: snehaPackage.id, status: 'CONFIRMED' },
  });

  // Puneesh's attendance: PRESENT (Session completed for critical test case)
  await prisma.attendance.create({
    data: {
      bookingId: b1.id,
      sessionId: session8am.id,
      clientId: puneesh.id,
      status: 'PRESENT',
      markedAt: new Date(today.getTime() - 2 * 60 * 60 * 1000),
      markedByUserId: specialistUser.id,
      notes: 'Completed all McGill Big 3 exercises without pain.',
    },
  });

  await prisma.attendance.create({
    data: { bookingId: b2.id, sessionId: session8am.id, clientId: ananya.id, status: 'PENDING' },
  });
  await prisma.attendance.create({
    data: { bookingId: b3.id, sessionId: session8am.id, clientId: vikram.id, status: 'PENDING' },
  });
  await prisma.attendance.create({
    data: { bookingId: b4.id, sessionId: session8am.id, clientId: sneha.id, status: 'PENDING' },
  });

  // Slot 3: 9:00 AM - 10:00 AM Semi-Private (2/4 -> 50% Amber)
  const session9am = await prisma.session.create({
    data: {
      title: 'Mid-Morning Functional Strength — Semi-Private',
      date: today,
      startTime: '09:00',
      endTime: '10:00',
      serviceType: 'SEMI_PRIVATE',
      specialistId: spec2.id,
      maxCapacity: 4,
      currentCapacity: 2,
      status: 'CONFIRMED',
    },
  });

  // Slot 4: 10:00 AM - 11:00 AM Semi-Private (1/4 -> 25% Blue)
  const session10am = await prisma.session.create({
    data: {
      title: 'Lower Limb Biomechanics & Knee Rehab — Semi-Private',
      date: today,
      startTime: '10:00',
      endTime: '11:00',
      serviceType: 'SEMI_PRIVATE',
      specialistId: spec3.id,
      maxCapacity: 4,
      currentCapacity: 1,
      status: 'CONFIRMED',
    },
  });

  // 8. Sample Documents, Consent, Notes, and Follow-ups for Puneesh
  await prisma.document.create({
    data: {
      clientId: puneesh.id,
      type: 'MEDICAL_CLEARANCE',
      fileName: 'Dr_Sharma_Spine_Clearance_Puneesh.pdf',
      filePath: '/uploads/documents/clearance_puneesh.pdf',
      fileSize: 1048576, // 1MB
      uploadedByUserId: owner.id,
      accessPermission: 'STAFF_ONLY',
      notes: 'Physician approval for progressive core strengthening and lumbar stabilization.',
    },
  });

  await prisma.consent.create({
    data: {
      clientId: puneesh.id,
      consentVersion: 'v1.0',
      consentText: 'I hereby acknowledge and consent to participate in AUREX Clinical Exercise and Medical Fitness programming under specialist supervision...',
      status: 'SIGNED',
      acknowledgedBy: 'Dr. Siddharth Rao',
      ipAddress: '192.168.1.45',
      digitalSignature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    },
  });

  await prisma.note.create({
    data: {
      clientId: puneesh.id,
      content: 'Initial consultation complete. Client motivated to restore posture and resume badminton.',
      category: 'CLINICAL',
      authorId: specialistUser.id,
    },
  });

  await prisma.followUp.create({
    data: {
      clientId: puneesh.id,
      type: 'CALL',
      notes: 'Follow-up call post initial session. Puneesh reported zero pain and great experience.',
      followUpDate: today,
      completed: true,
      completedAt: today,
      loggedByUserId: receptionist.id,
    },
  });

  await prisma.notification.create({
    data: {
      clientId: puneesh.id,
      type: 'BOOKING_CONFIRMATION',
      message: 'Your Semi-Private Clinical Session is confirmed for 08:00 AM with Dr. Raghav Mehta.',
      status: 'SENT',
      channel: 'EMAIL',
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: specialistUser.id,
      action: 'COMPLETE_SESSION',
      entity: 'Session',
      entityId: session8am.id,
      details: JSON.stringify({ client: 'Puneesh', deduction: '12 -> 11 sessionsRemaining' }),
      ipAddress: '127.0.0.1',
    },
  });

  // 9. Create Expenses
  await prisma.expense.create({
    data: {
      date: today,
      description: 'Rehab Band Replacements & Sanitisers',
      amount: 4500,
      category: 'OPERATIONAL',
      loggedByUserId: manager.id,
    },
  });

  await prisma.expense.create({
    data: {
      date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000),
      description: 'Air Conditioning Maintenance',
      amount: 12000,
      category: 'MAINTENANCE',
      loggedByUserId: manager.id,
    },
  });

  // 10. Create Leads for CRM
  const sampleLeads = [
    { firstName: 'Sarb', lastName: 'Singh', name: 'Sarb Singh', phone: '8874402300', source: 'Website', stage: 'NEW_LEAD', convertibility: 'HOT', response: 'Called back', service: 'Semi-Private', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
    { firstName: 'Simran', lastName: 'Kaur', name: 'Simran Kaur', phone: '6280755152', source: 'Instagram', stage: 'CONTACTED', convertibility: 'WARM', response: 'Timing issue', service: 'Premium', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
    { firstName: 'Kanika', lastName: 'Kapoor', name: 'Kanika Kapoor', phone: '8699288803', source: 'Google', stage: 'ASSESSMENT_BOOKED', convertibility: 'HOT', response: 'Will join later', service: 'Assessment', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
    { firstName: 'Anchal', lastName: 'Sharma', name: 'Anchal Sharma', phone: '6834575420', source: 'WhatsApp', stage: 'NEW_LEAD', convertibility: 'WARM', response: 'Call not picked', service: 'Semi-Private', date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) },
    { firstName: 'Rajat', lastName: 'Verma', name: 'Rajat Verma', phone: '9910088776', source: 'Referral', stage: 'NEW_LEAD', convertibility: 'HOT', response: 'Out of station', service: 'Semi-Private', date: today },
    { firstName: 'Divya', lastName: 'Nambiar', name: 'Divya Nambiar', phone: '9920077665', source: 'Google', stage: 'NEW_LEAD', convertibility: 'WARM', response: 'Price too high', service: 'Premium', date: today },
  ];

  for (const l of sampleLeads) {
    await prisma.lead.create({
      data: {
        firstName: l.firstName,
        lastName: l.lastName,
        name: l.name,
        phone: l.phone,
        source: l.source,
        stage: l.stage,
        convertibility: l.convertibility,
        service: l.service,
        response: l.response,
        createdAt: l.date,
        notes: 'Inquiry received via campaign / website portal.',
      },
    });
  }

  console.log('✅ Created CRM Leads, Expenses, and Sample Activity');
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
