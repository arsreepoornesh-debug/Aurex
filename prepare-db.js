const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
if (fs.existsSync(schemaPath)) {
  let schema = fs.readFileSync(schemaPath, 'utf8');
  const dbUrl = process.env.DATABASE_URL || '';

  if (dbUrl.startsWith('file:') || (!dbUrl && process.env.NODE_ENV !== 'production')) {
    console.log('[prepare-db] Configuring Prisma datasource for SQLite...');
    schema = schema.replace(/provider\s*=\s*"postgresql"/g, 'provider = "sqlite"');
  } else {
    console.log('[prepare-db] Configuring Prisma datasource for PostgreSQL...');
    schema = schema.replace(/provider\s*=\s*"sqlite"/g, 'provider = "postgresql"');
  }

  fs.writeFileSync(schemaPath, schema, 'utf8');
  console.log('[prepare-db] schema.prisma datasource provider verified.');
}
