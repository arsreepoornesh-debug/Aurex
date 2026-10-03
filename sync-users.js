const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function syncUsers() {
  console.log('🔄 Syncing staff accounts (Owner: Prasan, Manager, Receptionist)...');
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

  console.log('✅ 3 Staff accounts verified and passwords synchronized.');
}

if (require.main === module) {
  syncUsers()
    .catch((err) => {
      console.error('❌ Error syncing users:', err);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}

module.exports = { syncUsers };
