const { execSync, spawn } = require('child_process');

console.log('==============================================');
console.log('🚀 Starting AUREX CMS on Railway...');
console.log('==============================================');

// 1. Sync DB Schema with PostgreSQL
try {
  console.log('📦 Pushing database schema to PostgreSQL...');
  execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
  console.log('✅ PostgreSQL Schema synchronized.');
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
