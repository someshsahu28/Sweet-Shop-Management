/**
 * Script to seed the database with sample sweets using direct SQL
 * Usage: npx ts-node src/scripts/seedSweetsDirect.ts
 */

import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const sampleSweets = [
  { name: 'Chocolate Bar', category: 'Chocolate', price: 2.50, quantity: 25 },
  { name: 'Gummy Bears', category: 'Candy', price: 1.75, quantity: 50 },
  { name: 'Lollipop', category: 'Candy', price: 0.75, quantity: 100 },
  { name: 'Caramel Candy', category: 'Caramel', price: 1.25, quantity: 30 },
  { name: 'Marshmallow', category: 'Soft Candy', price: 1.00, quantity: 40 },
  { name: 'Jelly Beans', category: 'Candy', price: 2.00, quantity: 60 },
  { name: 'Hard Candy', category: 'Candy', price: 0.50, quantity: 80 },
  { name: 'Chocolate Truffle', category: 'Chocolate', price: 3.50, quantity: 15 },
  { name: 'Licorice', category: 'Candy', price: 1.50, quantity: 20 },
  { name: 'Sour Patch Kids', category: 'Candy', price: 2.25, quantity: 35 },
  { name: 'Peppermint', category: 'Mint', price: 0.80, quantity: 90 },
  { name: 'Fudge', category: 'Chocolate', price: 4.00, quantity: 10 },
  { name: 'Taffy', category: 'Soft Candy', price: 1.20, quantity: 45 },
  { name: 'Rock Candy', category: 'Hard Candy', price: 1.00, quantity: 55 },
  { name: 'Chocolate Chip Cookie', category: 'Baked Goods', price: 2.75, quantity: 12 }
];

const seedSweets = async () => {
  let connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('❌ DATABASE_URL not set in .env file');
    process.exit(1);
  }

  // Handle Prisma proxy URLs
  if (connectionString.startsWith('prisma+postgres://') || connectionString.startsWith('prisma://')) {
    try {
      const url = new URL(connectionString);
      const apiKey = url.searchParams.get('api_key');
      if (apiKey) {
        const decoded = Buffer.from(apiKey, 'base64').toString('utf-8');
        const apiKeyData = JSON.parse(decoded);
        if (apiKeyData.databaseUrl) {
          connectionString = apiKeyData.databaseUrl;
        } else if (apiKeyData.shadowDatabaseUrl) {
          connectionString = apiKeyData.shadowDatabaseUrl;
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
      : false
  });

  try {
    console.log('Starting to seed sweets...');

    // Check existing sweets
    const existingResult = await pool.query('SELECT name FROM sweets');
    const existingNames = new Set(existingResult.rows.map(r => r.name));

    let added = 0;
    let skipped = 0;

    for (const sweet of sampleSweets) {
      if (existingNames.has(sweet.name)) {
        console.log(`Skipping "${sweet.name}" - already exists`);
        skipped++;
        continue;
      }

      try {
        await pool.query(
          'INSERT INTO sweets (name, category, price, quantity) VALUES ($1, $2, $3, $4)',
          [sweet.name, sweet.category, sweet.price, sweet.quantity]
        );
        console.log(`✓ Added: ${sweet.name} - ${sweet.category} - $${sweet.price} - Qty: ${sweet.quantity}`);
        added++;
      } catch (error: any) {
        if (error.code === '23505') { // Unique violation
          console.log(`Skipping "${sweet.name}" - already exists`);
          skipped++;
        } else {
          console.error(`Error adding "${sweet.name}":`, error.message);
        }
      }
    }

    console.log('\n✅ Seeding complete!');
    console.log(`   Added: ${added} sweets`);
    console.log(`   Skipped: ${skipped} sweets (already exist)`);
    
    // Show current count
    const totalResult = await pool.query('SELECT COUNT(*) as count FROM sweets');
    console.log(`   Total sweets in database: ${totalResult.rows[0].count}`);
    
    await pool.end();
    process.exit(0);
  } catch (error: any) {
    console.error('Error seeding sweets:', error.message);
    await pool.end();
    process.exit(1);
  }
};

seedSweets();
