/**
 * Script to test database connection
 * Usage: npx ts-node src/scripts/testConnection.ts
 */

import { prisma } from '../database/prisma';
import dotenv from 'dotenv';

dotenv.config();

const testConnection = async () => {
  try {
    console.log('Testing database connection...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set (hidden)' : 'NOT SET');
    
    await prisma.$connect();
    console.log('✅ Successfully connected to database!');
    
    // Try a simple query
    const userCount = await prisma.user.count();
    const sweetCount = await prisma.sweet.count();
    
    console.log(`📊 Current database state:`);
    console.log(`   Users: ${userCount}`);
    console.log(`   Sweets: ${sweetCount}`);
    
    await prisma.$disconnect();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Database connection failed!');
    console.error('Error:', error.message);
    console.error('\n💡 Make sure:');
    console.error('   1. Your DATABASE_URL in .env is correct');
    console.error('   2. Your database server is running');
    console.error('   3. Your network allows connections to the database');
    await prisma.$disconnect().catch(() => {});
    process.exit(1);
  }
};

testConnection();
