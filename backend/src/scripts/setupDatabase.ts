/**
 * Script to set up database tables using Prisma
 * Usage: npx ts-node src/scripts/setupDatabase.ts
 */

import { prisma } from '../database/prisma';
import dotenv from 'dotenv';

dotenv.config();

const setupDatabase = async () => {
  try {
    console.log('Setting up database tables...');

    // Create users table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created users table');

    // Create sweets table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS sweets (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        category VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created sweets table');

    // Create updated_at trigger function
    await prisma.$executeRawUnsafe(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Create triggers
    await prisma.$executeRawUnsafe(`
      DROP TRIGGER IF EXISTS update_users_updated_at ON users;
      CREATE TRIGGER update_users_updated_at
      BEFORE UPDATE ON users
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);

    await prisma.$executeRawUnsafe(`
      DROP TRIGGER IF EXISTS update_sweets_updated_at ON sweets;
      CREATE TRIGGER update_sweets_updated_at
      BEFORE UPDATE ON sweets
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);

    console.log('✅ Created triggers for updated_at');

    // Verify tables
    const userCount = await prisma.$queryRawUnsafe<Array<{ count: bigint }>>('SELECT COUNT(*) as count FROM users');
    const sweetCount = await prisma.$queryRawUnsafe<Array<{ count: bigint }>>('SELECT COUNT(*) as count FROM sweets');

    console.log('\n📊 Database ready!');
    console.log(`   Users: ${Number(userCount[0].count)}`);
    console.log(`   Sweets: ${Number(sweetCount[0].count)}`);

    await prisma.$disconnect();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error setting up database:', error.message);
    console.error('Full error:', error);
    await prisma.$disconnect().catch(() => {});
    process.exit(1);
  }
};

setupDatabase();
