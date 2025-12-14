/**
 * Script to help fix DATABASE_URL format
 * Usage: npx ts-node src/scripts/fixDatabaseUrl.ts
 */

import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const currentUrl = process.env.DATABASE_URL;

console.log('🔍 Current DATABASE_URL format check...\n');

if (!currentUrl) {
  console.error('❌ DATABASE_URL not found in .env file');
  process.exit(1);
}

if (currentUrl.startsWith('prisma+postgres://') || currentUrl.startsWith('prisma://')) {
  console.error('❌ Your DATABASE_URL is using Prisma proxy format, not direct PostgreSQL connection!');
  console.error('\n📋 Current format:');
  console.error(`   ${currentUrl.substring(0, 50)}...`);
  console.error('\n✅ Required format for NeonDB:');
  console.error('   postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require');
  console.error('\n📝 Steps to fix:');
  console.error('   1. Go to https://neon.tech');
  console.error('   2. Log in and select your project');
  console.error('   3. Go to "Connection Details" or "Connection String"');
  console.error('   4. Copy the connection string (starts with postgresql://)');
  console.error('   5. Update DATABASE_URL in backend/.env file');
  console.error('   6. Run: npx ts-node src/scripts/checkDatabase.ts');
  process.exit(1);
} else if (currentUrl.startsWith('postgresql://') || currentUrl.startsWith('postgres://')) {
  console.log('✅ DATABASE_URL format looks correct!');
  console.log(`   Format: ${currentUrl.substring(0, 30)}...`);
  console.log('\n🔍 Now testing connection...');
  console.log('   Run: npx ts-node src/scripts/checkDatabase.ts');
  process.exit(0);
} else {
  console.error('❌ Unknown DATABASE_URL format');
  console.error(`   Found: ${currentUrl.substring(0, 50)}...`);
  console.error('\n✅ Should start with: postgresql:// or postgres://');
  process.exit(1);
}
