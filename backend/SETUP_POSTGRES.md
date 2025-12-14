# PostgreSQL Setup Guide

This project uses PostgreSQL with Prisma ORM. Follow these steps to set up your database.

## 1. Database Setup

### Option A: Using NeonDB (Recommended for Cloud)

1. Go to [NeonDB](https://neon.tech) and create a free account
2. Create a new project
3. Copy your connection string (it will look like):
   ```
   postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
   ```

### Option B: Using Local PostgreSQL

1. Install PostgreSQL on your machine
2. Create a database:
   ```sql
   CREATE DATABASE sweet_shop;
   ```
3. Your connection string will be:
   ```
   postgresql://postgres:password@localhost:5432/sweet_shop
   ```

## 2. Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Secret (Change this in production!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Database URL (PostgreSQL)
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
```

**Important:** Replace the `DATABASE_URL` with your actual database connection string.

## 3. Initialize Prisma

Run these commands in the `backend` directory:

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations to create tables
npm run prisma:migrate
```

This will:
- Create the `users` and `sweets` tables in your database
- Generate the Prisma Client for TypeScript

## 4. Seed the Database

```bash
# Add sample sweets
npm run seed
```

## 5. Create an Admin User

```bash
# Create admin user
npx ts-node src/scripts/createAdmin.ts admin admin@example.com admin123
```

## 6. Start the Server

```bash
npm run dev
```

## Useful Commands

- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio (database GUI)
- `npm run seed` - Seed database with sample sweets

## Troubleshooting

### Connection Issues
- Make sure your `DATABASE_URL` is correct
- For NeonDB, ensure `sslmode=require` is in the connection string
- Check that your database is accessible from your network

### Migration Issues
- If tables already exist, Prisma will handle it gracefully
- You can reset the database with: `npx prisma migrate reset` (WARNING: This deletes all data)
