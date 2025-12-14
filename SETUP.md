# Setup Guide

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn

## Initial Setup

### 1. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
DB_PATH=./sweet_shop.db
```

Start the backend server:

```bash
npm run dev
```

The backend will run on `http://localhost:3000` and automatically create the SQLite database.

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Start the frontend development server:

```bash
npm run dev
```

The frontend will run on `http://localhost:3001`.

### 3. Create an Admin User

To create an admin user, you have two options:

#### Option 1: Using the script (Recommended)

```bash
cd backend
npx ts-node src/scripts/createAdmin.ts admin admin@example.com password123
```

#### Option 2: Manual database update

1. Register a regular user through the frontend
2. Use a SQLite tool to update the user's role:
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
   ```

## Running Tests

### Backend Tests

```bash
cd backend
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # With coverage
```

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── __tests__/      # Test files
│   │   ├── database/        # Database setup
│   │   ├── middleware/      # Auth middleware
│   │   ├── routes/          # API routes
│   │   └── scripts/         # Utility scripts
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── context/         # React context (Auth)
│   │   ├── pages/           # Page components
│   │   └── services/        # API services
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## Troubleshooting

### Database Issues

If you encounter database errors:
1. Delete the `sweet_shop.db` file in the backend directory
2. Restart the server (it will recreate the database)

### Port Already in Use

If port 3000 or 3001 is already in use:
- Backend: Change `PORT` in `.env`
- Frontend: Change port in `vite.config.ts`

### TypeScript Errors in Tests

The TypeScript errors in test files will resolve after running `npm install` in the backend directory, which installs the necessary type definitions.

