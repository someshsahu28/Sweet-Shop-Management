/**
 * Script to create an admin user
 * Usage: npx ts-node src/scripts/createAdmin.ts <username> <email> <password>
 */

import bcrypt from 'bcryptjs';
import { prisma } from '../database/prisma';

const createAdmin = async () => {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.error('Usage: npx ts-node src/scripts/createAdmin.ts <username> <email> <password>');
    process.exit(1);
  }

  const [username, email, password] = args;

  try {
    // Check if user already exists
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ]
      }
    });

    if (existing) {
      console.error('User with this username or email already exists');
      await prisma.$disconnect();
      process.exit(1);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: 'admin'
      }
    });

    console.log(`Admin user "${username}" created successfully!`);
    console.log(`Email: ${email}`);
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

createAdmin();

