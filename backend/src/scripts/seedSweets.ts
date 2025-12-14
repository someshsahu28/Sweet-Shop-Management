/**
 * Script to seed the database with sample sweets
 * Usage: npx ts-node src/scripts/seedSweets.ts
 */

import { prisma } from '../database/prisma';

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
  try {
    console.log('Starting to seed sweets...');

    // Check existing sweets
    const existing = await prisma.sweet.findMany({
      select: { name: true }
    });
    const existingNames = new Set(existing.map(s => s.name));

    let added = 0;
    let skipped = 0;

    for (const sweet of sampleSweets) {
      if (existingNames.has(sweet.name)) {
        console.log(`Skipping "${sweet.name}" - already exists`);
        skipped++;
        continue;
      }

      try {
        await prisma.sweet.create({
          data: {
            name: sweet.name,
            category: sweet.category,
            price: sweet.price,
            quantity: sweet.quantity
          }
        });
        console.log(`✓ Added: ${sweet.name} - ${sweet.category} - $${sweet.price} - Qty: ${sweet.quantity}`);
        added++;
      } catch (error: any) {
        if (error.code === 'P2002') {
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
    const total = await prisma.sweet.count();
    console.log(`   Total sweets in database: ${total}`);
    
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding sweets:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

seedSweets();
