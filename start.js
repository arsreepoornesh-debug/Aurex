const { execSync, spawn } = require('child_process');

console.log('==============================================');
console.log('🚀 Starting AUREX CMS on Railway...');
console.log('==============================================');

// 0. Ensure required env vars have safe fallbacks before Prisma initialises
if (!process.env.DATABASE_URL) {
  console.error('❌ FATAL: DATABASE_URL is not set. Please set it in Railway Variables.');
  process.exit(1);
}
if (!process.env.NEXTAUTH_URL) {
  // Railway injects RAILWAY_PUBLIC_DOMAIN automatically
  const domain = process.env.RAILWAY_PUBLIC_DOMAIN || process.env.RAILWAY_STATIC_URL;
  process.env.NEXTAUTH_URL = domain ? `https://${domain}` : 'http://localhost:3000';
  console.log(`ℹ️  NEXTAUTH_URL not set — defaulting to ${process.env.NEXTAUTH_URL}`);
}
if (!process.env.NEXTAUTH_SECRET) {
  process.env.NEXTAUTH_SECRET = 'aurex-clinical-exercise-super-secret-key-2026';
  console.log('ℹ️  NEXTAUTH_SECRET not set — using built-in default');
}

console.log(`✅ Environment ready: DATABASE_URL=${process.env.DATABASE_URL.substring(0, 30)}...`);


// 1. Sync DB Schema (SQLite local / PostgreSQL prod via DATABASE_URL)
try {
  console.log('📦 Pushing database schema...');
  execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
  console.log('✅ Database schema synchronized.');
} catch (err) {
  console.error('⚠️ Note on schema push:', err.message);
}

// 2. Initialize default Staff accounts if not present
try {
  console.log('🌱 Initializing staff accounts (Owner, Manager, Receptionist)...');
  execSync('npx tsx prisma/clean.ts', { stdio: 'inherit' });
  console.log('✅ Staff accounts and master packages verified.');
} catch (err) {
  console.error('⚠️ Note on seed initialization:', err.message);
}

// 3. Launch Next.js Server on 0.0.0.0 with Railway PORT
const port = process.env.PORT || '3000';
console.log(`🌐 Starting Next.js listener on host 0.0.0.0:${port}...`);

const nextApp = spawn('npx', ['next', 'start', '-H', '0.0.0.0', '-p', port], {
  stdio: 'inherit',
  shell: true,
});

nextApp.on('close', (code) => {
  console.log(`Next.js process exited with code ${code}`);
  process.exit(code || 0);
});
