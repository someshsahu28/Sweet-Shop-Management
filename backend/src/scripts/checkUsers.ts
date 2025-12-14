/**
 * Script to check users in database
 * Usage: npx ts-node src/scripts/checkUsers.ts
 */

import { prisma } from '../database/prisma';

const checkUsers = async () => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true
      }
    });

    console.log('\n📊 Users in database:');
    console.log('='.repeat(50));
    
    if (users.length === 0) {
      console.log('No users found.');
    } else {
      users.forEach(user => {
        console.log(`\nID: ${user.id}`);
        console.log(`Username: ${user.username}`);
        console.log(`Email: ${user.email}`);
        console.log(`Role: ${user.role} ${user.role === 'admin' ? '👑' : ''}`);
      });
    }

    const adminCount = users.filter(u => u.role === 'admin').length;
    console.log(`\n\nTotal users: ${users.length}`);
    console.log(`Admin users: ${adminCount}`);

    if (adminCount === 0) {
      console.log('\n⚠️  No admin users found!');
      console.log('Create one with:');
      console.log('npx ts-node src/scripts/createAdmin.ts admin admin@example.com yourpassword');
    }

    await prisma.$disconnect();
    process.exit(0);
  } catch (error: any) {
    console.error('Error:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
};

checkUsers();
