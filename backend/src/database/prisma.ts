import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

let connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Handle Prisma proxy URLs - extract the actual database URL from the API key
if (connectionString.startsWith('prisma+postgres://') || connectionString.startsWith('prisma://')) {
  try {
    // Extract API key from URL
    const url = new URL(connectionString);
    const apiKey = url.searchParams.get('api_key');
    
    if (apiKey) {
      // Decode the base64 encoded API key to get the actual database URL
      const decoded = Buffer.from(apiKey, 'base64').toString('utf-8');
      const apiKeyData = JSON.parse(decoded);
      
      if (apiKeyData.databaseUrl) {
        const extractedUrl = apiKeyData.databaseUrl;
        // Check if extracted URL is localhost (Prisma proxy local endpoint)
        if (extractedUrl.includes('localhost') || extractedUrl.includes('127.0.0.1')) {
          console.error('❌ ERROR: Prisma proxy URL extracts to localhost, which is not accessible!');
          console.error('💡 SOLUTION: Use your direct NeonDB connection string instead of Prisma proxy URL.');
          console.error('   Format: postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require');
          console.error('   Get it from: https://neon.tech → Your Project → Connection Details');
          throw new Error('Prisma proxy URL points to localhost. Please use direct NeonDB connection string in DATABASE_URL.');
        }
        connectionString = extractedUrl;
        console.log('✅ Extracted database URL from Prisma proxy');
      } else if (apiKeyData.shadowDatabaseUrl) {
        const extractedUrl = apiKeyData.shadowDatabaseUrl;
        if (extractedUrl.includes('localhost') || extractedUrl.includes('127.0.0.1')) {
          console.error('❌ ERROR: Prisma proxy shadow URL extracts to localhost!');
          throw new Error('Prisma proxy shadow URL points to localhost. Please use direct NeonDB connection string.');
        }
        connectionString = extractedUrl;
        console.log('✅ Extracted shadow database URL from Prisma proxy');
      }
    }
  } catch (error: any) {
    if (error.message.includes('localhost')) {
      throw error; // Re-throw localhost errors
    }
    console.warn('⚠️  Could not extract database URL from Prisma proxy, using as-is');
  }
}

if (!connectionString) {
  throw new Error('Could not determine database connection string from DATABASE_URL');
}

// Ensure it's a postgresql:// URL
if (!connectionString.startsWith('postgresql://') && !connectionString.startsWith('postgres://')) {
  throw new Error(`DATABASE_URL must start with postgresql:// or postgres://, got: ${connectionString.substring(0, 30)}...`);
}

// Warn if still using localhost (shouldn't happen for NeonDB)
if (connectionString.includes('localhost') || connectionString.includes('127.0.0.1')) {
  console.warn('⚠️  WARNING: DATABASE_URL points to localhost. For NeonDB, use your cloud connection string.');
}

// Configure SSL for NeonDB and other cloud providers
const sslConfig = 
  connectionString.includes('sslmode=require') || 
  connectionString.includes('neon.tech') ||
  connectionString.includes('aws.neon.tech')
    ? { rejectUnauthorized: false }
    : false;

const pool = new Pool({ 
  connectionString,
  ssl: sslConfig,
  connectionTimeoutMillis: 30000,
  idleTimeoutMillis: 30000
});

const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
