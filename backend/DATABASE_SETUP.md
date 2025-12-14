# Database Connection Setup

## ⚠️ Important: DATABASE_URL Format

Your `backend/.env` file must contain a **direct PostgreSQL connection string**, not a Prisma proxy URL.

### ✅ Correct Format (NeonDB):

```env
DATABASE_URL=postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
```

### ❌ Wrong Format (Prisma Proxy):

```env
DATABASE_URL=prisma+postgres://localhost:51213/?api_key=...
```

## How to Get Your NeonDB Connection String

1. Go to https://neon.tech
2. Log in to your account
3. Select your project
4. Go to "Connection Details" or "Connection String"
5. Copy the connection string that looks like:
   ```
   postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
   ```

## Update Your .env File

1. Open `backend/.env`
2. Replace the `DATABASE_URL` line with your actual NeonDB connection string
3. Save the file

## Verify Connection

After updating, test the connection:

```bash
cd backend
npx ts-node src/scripts/checkDatabase.ts
```

This will show you:
- ✅ If connection is successful
- ❌ If there are any issues and what to fix

## Initialize Database

Once connection works:

```bash
# Create tables
npx ts-node src/scripts/initDatabase.ts

# Seed with sweets
npm run seed

# Create admin user
npx ts-node src/scripts/createAdmin.ts admin admin@example.com yourpassword
```

## Start Servers

```bash
# Backend
npm run dev

# Frontend (in another terminal)
cd ../frontend
npm run dev
```
