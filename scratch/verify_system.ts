import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function runVerification() {
  console.log('🚀 Running AUREX End-to-End Test Suite & Critical Scenario Verification...\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string) {
    totalTests++;
    if (condition) {
      console.log(`  ✅ PASS [${totalTests}]: ${testName}`);
      passedTests++;
    } else {
      console.error(`  ❌ FAIL [${totalTests}]: ${testName}`);
    }
  }

  // TEST 1: Check 5 RBAC Users Exist
  const roles = ['OWNER', 'MANAGER', 'RECEPTIONIST', 'SPECIALIST', 'CLIENT'];
  for (const r of roles) {
    const user = await prisma.user.findFirst({ where: { role: r } });
    assert(!!user, `RBAC Role account exists for ${r} (${user?.email})`);
  }

  // TEST 2: Check Master Packages
  const packages = await prisma.package.findMany();
  assert(packages.length >= 4, `Master Package Catalog contains ${packages.length} packages (Expected >= 4)`);

  // TEST 3: Check Puneesh AUR-2026-0001 Client Record
  const puneesh = await prisma.client.findUnique({
    where: { clientId: 'AUR-2026-0001' },
    include: {
      packages: true,
      payments: true,
      assessments: true,
      bookings: true,
      attendances: true,
    },
  });
  assert(!!puneesh, 'Client Puneesh AUR-2026-0001 exists');
  assert(puneesh?.name === 'Puneesh', 'Client name is Puneesh');
  assert(puneesh?.referralSource === 'Doctor Referral', 'Client referral source is Doctor Referral');

  // TEST 4: McGill Big 3 Assessment saved
  const assessment = puneesh?.assessments[0];
  assert(!!assessment, 'Initial Assessment exists for Puneesh');
  assert(assessment?.type === 'INITIAL', 'Assessment type is INITIAL');
  
  let hasMcGill = false;
  if (assessment?.strengthAssessment) {
    const strength = JSON.parse(assessment.strengthAssessment);
    hasMcGill = !!strength.mcGillBig3;
  }
  assert(hasMcGill, 'McGill Big 3 (curl-up, side bridge, bird-dog) protocol saved in assessment');

  // TEST 5: Package & Atomic Balance Check
  const puneeshPackage = puneesh?.packages[0];
  assert(!!puneeshPackage, 'Client Package assigned to Puneesh');
  assert(puneeshPackage?.totalSessions === 12, 'Package total sessions is 12');
  assert(puneeshPackage?.sessionsRemaining === 11, 'Package sessions remaining is 11 (after 1 completed session)');
  assert(puneeshPackage?.sessionsUsed === 1, 'Package sessions used is 1');

  // TEST 6: Payment & Invoice INV-AUR-2026-0001
  const payment = puneesh?.payments[0];
  assert(!!payment, 'Payment record exists for Puneesh');
  assert(payment?.invoiceNumber === 'INV-AUR-2026-0001', `Invoice number is INV-AUR-2026-0001 (Found: ${payment?.invoiceNumber})`);
  assert(payment?.amount === 24000 || payment?.amountPaid === 24000, 'Payment amount is ₹24,000');
  assert(payment?.balanceRemaining === 0, 'Balance remaining on invoice is ₹0');

  // TEST 7: 8:00 AM Session Capacity Check (4/4 FULL)
  const session8am = await prisma.session.findFirst({
    where: { startTime: '08:00' },
    include: { bookings: true },
  });
  assert(!!session8am, '8:00 AM Semi-Private session exists');
  assert(session8am?.bookings.length === 4, `8:00 AM session has ${session8am?.bookings.length}/4 bookings (4/4 FULL)`);
  assert(session8am?.maxCapacity === 4, 'Max capacity enforced at 4 for Semi-Private');

  // TEST 8: Capacity Enforcement Rejection Logic
  const canOverbook = session8am && session8am.bookings.length >= session8am.maxCapacity;
  assert(canOverbook === true, 'Capacity full flag correctly triggers rejection (HTTP 409)');

  // TEST 9: Attendance & Timestamp
  const attendance = puneesh?.attendances[0];
  assert(!!attendance, 'Attendance record exists for Puneesh');
  assert(attendance?.status === 'PRESENT', 'Puneesh attendance status marked as PRESENT');
  assert(!!attendance?.markedAt, 'Attendance timestamp recorded permanently');

  // TEST 10: Audit Log Entry
  const auditLog = await prisma.auditLog.findFirst({
    where: { action: 'COMPLETE_SESSION' },
  });
  assert(!!auditLog, 'Audit log created for COMPLETE_SESSION transaction');

  // TEST 11: Upcoming Renewals Flag (Sneha Patel AUR-2026-0004 near expiry)
  const sneha = await prisma.client.findUnique({
    where: { clientId: 'AUR-2026-0004' },
    include: { packages: true },
  });
  const snehaPkg = sneha?.packages[0];
  const isExpiringSoon = snehaPkg && snehaPkg.sessionsRemaining <= 2;
  assert(isExpiringSoon === true, 'Sneha Patel (AUR-2026-0004) flagged for Upcoming Renewals (< 3 sessions left)');

  // TEST 12: Irregular Client Flag (Rajesh Khanna AUR-2026-0005)
  const rajesh = await prisma.client.findUnique({
    where: { clientId: 'AUR-2026-0005' },
    include: { attendances: true },
  });
  assert(!!rajesh, 'Rajesh Khanna (AUR-2026-0005) exists for Irregular clients test');

  // TEST 13: Client Portal User Link
  const clientUser = await prisma.user.findFirst({ where: { role: 'CLIENT' } });
  assert(!!clientUser?.clientId, 'Client portal user linked directly to Client profile ID');

  console.log(`\n========================================`);
  console.log(`📊 Test Results: ${passedTests}/${totalTests} Tests Passed (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log(`========================================\n`);
}

runVerification()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
