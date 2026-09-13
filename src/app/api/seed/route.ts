import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
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

    // 3. Create Specialists
    const spec1 = await prisma.specialist.create({
      data: {
        name: 'Dr. Raghav Mehta',
        email: 'raghav.mehta@aurex.com',
        phone: '+91 98111 00001',
        specialization: 'Clinical Exercise Physiologist & Spine Rehab',
        bio: 'Former sports physio with 12+ years experience in lumbar spine biomechanics & functional rehabilitation.',
        colorCode: '#10B981',
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
        colorCode: '#3B82F6',
        active: true,
      },
    });

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

    const today = new Date();
    const sixtyDaysFromNow = new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000);
    const fiveDaysFromNow = new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000);

    // 5. Critical Test Client: Puneesh (AUR-2026-0001)
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

    // Assign Assessment for Puneesh
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
          timelineWeeks: 12,
        }),
        baselineMetrics: JSON.stringify({
          heightCm: 178,
          weightKg: 82,
          bmi: 25.9,
          bloodPressureSystolic: 122,
          bloodPressureDiastolic: 78,
        }),
        functionalMovement: JSON.stringify({
          overheadSquatScore: 2,
          postureNotes: 'Anterior pelvic tilt with tight hip flexors.',
        }),
        cardioStrength: JSON.stringify({
          gripStrengthKg: 46,
          plankHoldSeconds: 55,
        }),
        clinicalNotes: JSON.stringify({
          findings: 'Mechanical low back pain secondary to core deconditioning.',
          exercisePrescription: 'McGill Big 3 (Bird-Dog, Side Plank, Modified Curl-up).',
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

    // Payment for Puneesh
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

    // 6. Other Clients
    const ananya = await prisma.client.create({
      data: {
        clientId: 'AUR-2026-0002',
        name: 'Ananya Roy',
        phone: '+91 98111 22334',
        email: 'ananya.roy@example.com',
        dob: new Date('1988-11-20'),
        gender: 'Female',
        registrationDate: today,
        referralSource: 'Instagram',
        status: 'ACTIVE',
        assignedSpecialistId: spec1.id,
      },
    });

    const vikram = await prisma.client.create({
      data: {
        clientId: 'AUR-2026-0003',
        name: 'Vikram Malhotra',
        phone: '+91 97222 33445',
        email: 'vikram.m@example.com',
        dob: new Date('1982-03-10'),
        gender: 'Male',
        registrationDate: today,
        referralSource: 'Google',
        status: 'ACTIVE',
        assignedSpecialistId: spec1.id,
      },
    });

    const sneha = await prisma.client.create({
      data: {
        clientId: 'AUR-2026-0004',
        name: 'Sneha Patel',
        phone: '+91 96333 44556',
        email: 'sneha.patel@example.com',
        dob: new Date('1995-08-25'),
        gender: 'Female',
        registrationDate: new Date(today.getTime() - 45 * 24 * 60 * 60 * 1000),
        referralSource: 'WhatsApp',
        status: 'ACTIVE',
        assignedSpecialistId: spec2.id,
      },
    });

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

    // 7. Today's Sessions
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

    // 8. CRM Leads & Followups
    const lead1 = await prisma.lead.create({
      data: {
        name: 'Rajat Kapoor',
        phone: '+91 99100 88776',
        email: 'rajat.k@gmail.com',
        stage: 'NEW_LEAD',
        source: 'Instagram',
        notes: 'Inquired about post-cervical fusion rehab.',
      },
    });

    await prisma.followUp.create({
      data: {
        leadId: lead1.id,
        type: 'CALL',
        notes: 'Follow up regarding doctor referral notes.',
        followUpDate: today,
        completed: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully with all roles, specialists, clients (including Puneesh), sessions, packages, and leads.',
    });
  } catch (err: any) {
    console.error('Error seeding database via API:', err);
    return NextResponse.json({ error: err.message || 'Seed failed' }, { status: 500 });
  }
}
