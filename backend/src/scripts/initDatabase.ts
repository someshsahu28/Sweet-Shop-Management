/**
 * Script to initialize database tables
 * Usage: npx ts-node src/scripts/initDatabase.ts
 */

import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const initDatabase = async () => {
  let connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('❌ DATABASE_URL not set in .env file');
    process.exit(1);
  }

  // Handle Prisma proxy URLs - extract actual database URL
  if (connectionString.startsWith('prisma+postgres://') || connectionString.startsWith('prisma://')) {
    try {
      const url = new URL(connectionString);
      const apiKey = url.searchParams.get('api_key');
      if (apiKey) {
        const decoded = Buffer.from(apiKey, 'base64').toString('utf-8');
        const apiKeyData = JSON.parse(decoded);
        if (apiKeyData.databaseUrl) {
          connectionString = apiKeyData.databaseUrl;
          console.log('✅ Extracted database URL from Prisma proxy');
        } else if (apiKeyData.shadowDatabaseUrl) {
          connectionString = apiKeyData.shadowDatabaseUrl;
          console.log('✅ Extracted shadow database URL from Prisma proxy');
        }
      }
    } catch (error) {
      console.error('Could not extract database URL from Prisma proxy');
    }
  }

  if (!connectionString) {
    console.error('❌ Could not determine database connection string');
    process.exit(1);
  }

  const pool = new Pool({ 
    connectionString,
    ssl: connectionString.includes('sslmode=require') || connectionString.includes('neon.tech') || connectionString.includes('aws.neon.tech')
      ? { rejectUnauthorized: false }
      : false,
    connectionTimeoutMillis: 30000
  });

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

    // Create updated_at trigger function
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
    const userResult = await pool.query('SELECT COUNT(*) as count FROM users');
    const sweetResult = await pool.query('SELECT COUNT(*) as count FROM sweets');

    console.log('\n📊 Database ready!');
    console.log(`   Users: ${userResult.rows[0].count}`);
    console.log(`   Sweets: ${sweetResult.rows[0].count}`);

    await pool.end();
    console.log('\n✅ Database initialization complete!');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error initializing database:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Connection refused. Please check:');
      console.error('   1. Your DATABASE_URL is correct');
      console.error('   2. Your database server is accessible');
      console.error('   3. Your network/firewall allows the connection');
    }
    await pool.end().catch(() => {});
    process.exit(1);
  }
};

initDatabase();
