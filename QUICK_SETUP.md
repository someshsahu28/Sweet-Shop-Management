# Quick Setup Guide

## ✅ Admin Portal Status
The admin portal is fully set up and ready! You can access it at:
- **URL**: http://localhost:3001/admin
- **Access**: Admin users only (regular users will be redirected)

## 🔧 Database Setup

### Step 1: Verify Your DATABASE_URL

Your `backend/.env` file should have a DATABASE_URL that looks like this for NeonDB:

```env
DATABASE_URL=postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
```

**Important**: 
- Make sure you're using your actual NeonDB connection string
- The connection string should NOT point to `localhost:51213` or `localhost:51214`
- It should point to your NeonDB endpoint (something like `ep-xxx-xxx.region.aws.neon.tech`)

### Step 2: Test Database Connection

```bash
cd backend
npx ts-node src/scripts/testConnection.ts
```

If this works, proceed to Step 3. If not, check your DATABASE_URL.

### Step 3: Create Database Tables

Since Prisma migrations might have issues, use this script:

```bash
cd backend
npx ts-node src/scripts/createTables.ts
```

This will create the `users` and `sweets` tables.

### Step 4: Seed the Database

```bash
cd backend
npm run seed
```

This adds 15 sample sweets to your database.

### Step 5: Create Admin User

```bash
cd backend
npx ts-node src/scripts/createAdmin.ts admin admin@example.com yourpassword
```

Replace `yourpassword` with a secure password.

### Step 6: Start the Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## 🎯 Access Points

- **Frontend Dashboard**: http://localhost:3001/dashboard
- **Admin Portal**: http://localhost:3001/admin (Admin only)
- **Backend API**: http://localhost:3000

## 🔐 Admin Portal Features

Once you login as admin, you'll see:

1. **Statistics Dashboard**
   - Total sweets count
   - Total stock quantity  
   - Low stock alerts (< 10 items)
   - Out of stock items
   - Total inventory value

2. **Management Tools**
   - Add new sweets
   - Edit existing sweets
   - Delete sweets
   - Restock inventory
   - View all sweets in a table

3. **Visual Indicators**
   - Color-coded stock status
   - Warning badges for low stock
   - Danger badges for out of stock

## 🐛 Troubleshooting

### Database Connection Issues

If you get connection errors:

1. **Check your DATABASE_URL** in `backend/.env`
   - Should be your NeonDB connection string
   - Should include `?sslmode=require` at the end
   - Should NOT be `localhost`

2. **Test the connection:**
   ```bash
   cd backend
   npx ts-node src/scripts/testConnection.ts
   ```

3. **If connection works but tables don't exist:**
   ```bash
   cd backend
   npx ts-node src/scripts/createTables.ts
   ```

### Admin Portal Not Showing

- Make sure you're logged in as an admin user
- Check that your user has `role: 'admin'` in the database
- The admin portal link appears in the dashboard header for admin users

## ✅ Verification Checklist

- [ ] DATABASE_URL is set correctly in `backend/.env`
- [ ] Database connection test passes
- [ ] Tables created successfully
- [ ] Database seeded with sweets
- [ ] Admin user created
- [ ] Backend server running on port 3000
- [ ] Frontend server running on port 3001
- [ ] Can login as admin
- [ ] Can access `/admin` portal
- [ ] Admin portal shows statistics and sweets table

Your admin portal is ready to use! 🎉
