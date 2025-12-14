/**
 * Script to create database tables directly
 * Usage: npx ts-node src/scripts/createTables.ts
 */

import { prisma } from '../database/prisma';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const createTables = async () => {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('❌ DATABASE_URL not set in .env file');
    process.exit(1);
  }

  const pool = new Pool({ connectionString });

  try {
    console.log('Creating database tables...');

    // Create users table
    await pool.query(`
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
    await pool.query(`
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

    // Create updated_at trigger function for users
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Create triggers
    await pool.query(`
      DROP TRIGGER IF EXISTS update_users_updated_at ON users;
      CREATE TRIGGER update_users_updated_at
      BEFORE UPDATE ON users
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);

    await pool.query(`
      DROP TRIGGER IF EXISTS update_sweets_updated_at ON sweets;
      CREATE TRIGGER update_sweets_updated_at
      BEFORE UPDATE ON sweets
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);

    console.log('✅ Created triggers for updated_at');

    // Verify tables
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    const sweetCount = await pool.query('SELECT COUNT(*) FROM sweets');

    console.log('\n📊 Database ready!');
    console.log(`   Users: ${userCount.rows[0].count}`);
    console.log(`   Sweets: ${sweetCount.rows[0].count}`);

    await pool.end();
    await prisma.$disconnect();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error creating tables:', error.message || error);
    console.error('Full error:', error);
    await pool.end().catch(() => {});
    await prisma.$disconnect().catch(() => {});
    process.exit(1);
  }
};

createTables();
