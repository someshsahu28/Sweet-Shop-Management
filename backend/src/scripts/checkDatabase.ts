/**
 * Script to check database connection and show details
 * Usage: npx ts-node src/scripts/checkDatabase.ts
 */

import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from backend directory
dotenv.config({ path: path.join(__dirname, '../../.env') });

const checkDatabase = async () => {
  let connectionString = process.env.DATABASE_URL;
  
  console.log('🔍 Checking database configuration...\n');
  
  if (!connectionString) {
    console.error('❌ DATABASE_URL not found in .env file');
    console.error('💡 Make sure you have a .env file in the backend directory with:');
    console.error('   DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require');
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
      console.warn('⚠️  Could not extract database URL from Prisma proxy');
    }
  }

  if (!connectionString) {
    console.error('❌ Could not determine database connection string');
    process.exit(1);
  }

  // Show connection string (masked)
  const maskedUrl = connectionString.replace(/:([^:@]+)@/, ':****@');
  console.log(`📋 DATABASE_URL: ${maskedUrl}`);
  
  // Parse connection string
  try {
    const url = new URL(connectionString.replace('postgresql://', 'http://').replace('postgres://', 'http://'));
    console.log(`   Host: ${url.hostname}`);
    console.log(`   Port: ${url.port || '5432'}`);
    console.log(`   Database: ${url.pathname.replace('/', '')}`);
    console.log(`   SSL: ${connectionString.includes('sslmode=require') || connectionString.includes('neon.tech') ? 'Required' : 'Not required'}`);
  } catch (e) {
    console.log('   ⚠️  Could not parse connection string');
  }

  console.log('\n🔌 Attempting connection...');

  const pool = new Pool({ 
    connectionString,
    ssl: connectionString.includes('sslmode=require') || connectionString.includes('neon.tech') || connectionString.includes('aws.neon.tech')
      ? { rejectUnauthorized: false } 
      : false,
    connectionTimeoutMillis: 30000
  });

  try {
    const client = await pool.connect();
    console.log('✅ Successfully connected to database!');
    
    // Test query
    const result = await client.query('SELECT version()');
    console.log(`   PostgreSQL version: ${result.rows[0].version.split(',')[0]}`);
    
    // Check if tables exist
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log(`\n📊 Existing tables: ${tablesResult.rows.length}`);
    if (tablesResult.rows.length > 0) {
      tablesResult.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
    }
    
    client.release();
    await pool.end();
    
    console.log('\n✅ Database connection test passed!');
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Database connection failed!');
    console.error(`   Error: ${error.message}`);
    console.error(`   Code: ${error.code || 'N/A'}`);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Connection refused. Possible issues:');
      console.error('   1. Database server is not running');
      console.error('   2. Wrong host/port in DATABASE_URL');
      console.error('   3. Firewall blocking the connection');
      console.error('   4. Network connectivity issues');
    } else if (error.code === 'ENOTFOUND') {
      console.error('\n💡 Host not found. Check:');
      console.error('   1. Hostname in DATABASE_URL is correct');
      console.error('   2. DNS resolution is working');
    } else if (error.message.includes('password')) {
      console.error('\n💡 Authentication failed. Check:');
      console.error('   1. Username and password in DATABASE_URL are correct');
    } else if (error.message.includes('database')) {
      console.error('\n💡 Database not found. Check:');
      console.error('   1. Database name in DATABASE_URL is correct');
      console.error('   2. Database exists on the server');
    }
    
    await pool.end().catch(() => {});
    process.exit(1);
  }
};

checkDatabase();
