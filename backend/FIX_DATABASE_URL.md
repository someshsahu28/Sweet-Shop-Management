# Fix Database Connection - IMPORTANT

## ❌ Current Issue

Your `DATABASE_URL` in `backend/.env` is using a Prisma proxy URL that extracts to `localhost:51214`, which is not accessible.

## ✅ Solution

You need to update your `backend/.env` file with the **direct NeonDB PostgreSQL connection string**.

### Steps:

1. **Go to NeonDB Dashboard:**
   - Visit https://neon.tech
   - Log in to your account
   - Select your project

2. **Get Connection String:**
   - Click on "Connection Details" or "Connection String"
   - Look for the connection string that starts with `postgresql://`
   - It should look like:
     ```
     postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
     ```

3. **Update `.env` file:**
   - Open `backend/.env`
   - Replace the `DATABASE_URL` line with your direct NeonDB connection string
   - Save the file

4. **Restart Backend:**
   ```bash
   # Stop current backend (Ctrl+C)
   cd backend
   npm run dev
   ```

5. **Initialize Database:**
   ```bash
   cd backend
   npx ts-node src/scripts/initDatabase.ts  # Create tables
   npm run seed                              # Add sweets
   npx ts-node src/scripts/createAdmin.ts admin admin@example.com yourpassword
   ```

## ✅ Correct Format

```env
DATABASE_URL=postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
```

## ❌ Wrong Format (Current)

```env
DATABASE_URL=prisma+postgres://localhost:51213/?api_key=...
```

The Prisma proxy URL format is for Prisma Accelerate/Data Proxy services, not for direct database connections. For this project, you need the direct PostgreSQL connection string.

## 🔍 Verify

After updating, test the connection:

```bash
cd backend
npx ts-node src/scripts/checkDatabase.ts
```

You should see:
- ✅ Successfully connected to database!
- ✅ PostgreSQL version: ...
- ✅ Existing tables: ...

If you see connection errors, double-check:
1. The connection string is correct
2. It starts with `postgresql://` (not `prisma://`)
3. It includes `?sslmode=require` at the end
4. The host is `ep-xxx-xxx.region.aws.neon.tech` (not `localhost`)
