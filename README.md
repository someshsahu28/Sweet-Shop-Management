# Sweet Shop Management System

A full-stack TDD kata project for managing a sweet shop with user authentication, inventory management, and admin capabilities.

## Project Structure

```
.
├── backend/          # Node.js/TypeScript Express API
├── frontend/         # React TypeScript SPA
└── README.md
```

## Tech Stack

### Backend

* Node.js with TypeScript
* Express.js
* SQLite (database)
* JWT (authentication)
* Jest (testing)

### Frontend

* React with TypeScript
* Modern UI framework

## Getting Started

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:3001` and proxy API requests to the backend.

## API Endpoints

### Authentication

* `POST /api/auth/register` – Register a new user
* `POST /api/auth/login` – Login user

### Sweets (Protected)

* `POST /api/sweets` – Add a new sweet
* `GET /api/sweets` – Get all sweets
* `GET /api/sweets/search` – Search sweets
* `PUT /api/sweets/:id` – Update a sweet
* `DELETE /api/sweets/:id` – Delete a sweet (Admin only)

### Inventory (Protected)

* `POST /api/sweets/:id/purchase` – Purchase a sweet
* `POST /api/sweets/:id/restock` – Restock a sweet (Admin only)

## Running Tests

### Backend Tests

```bash
cd backend
npm test              # Run tests once
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

## Development Approach

This project follows Test-Driven Development (TDD) principles:

1. Write tests first (Red)
2. Implement functionality (Green)
3. Refactor code (Refactor)

The test files are located in `backend/src/__tests__/` and cover:

* Authentication (register/login)
* Sweets CRUD operations
* Inventory management (purchase/restock)
* Admin-only endpoints

## Features

### User Features

* User registration and login with JWT authentication
* Browse all available sweets
* Search sweets by name, category, or price range
* Purchase sweets (decreases inventory)

### Admin Features

* All user features plus:
* Add new sweets
* Edit existing sweets
* Delete sweets
* Restock inventory

## Admin Portal Credentials

For accessing the admin portal during development/testing, use the following credentials:

* **Email:** `admin@example.com`
* **Password:** `admin@123`

> ⚠️ These credentials are for local development only. Do **not** use them in production environments.

## Database

The application uses SQLite for data persistence. The database file (`sweet_shop.db`) is created automatically in the backend directory when the server starts.

### Creating an Admin User

To create an admin user, you can either:

1. Manually insert into the database with `role = 'admin'`
2. Use a database tool to update an existing user's role

## Environment Variables

Create a `.env` file in the `backend` directory:

```
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
DATABASE_URL =./sweet_shop.db
```

## AI Co-authorship

This project uses AI tools for development. Commits that include AI assistance include co-author trailers as per the project requirements.

### Example Commit Message

```
Add authentication endpoints

Implemented JWT-based authentication with register and login endpoints.

Co-authored-by: AI Assistant <ai@example.com>
```
<img width="1918" height="1017" alt="sweet1" src="https://github.com/user-attachments/assets/721a5924-f8e8-404b-af01-d9dd37b2acb0" />
<img width="1892" height="916" alt="sweet2" src="https://github.com/user-attachments/assets/24a9aa6d-c7e7-4c51-ae57-435cd7b7ed14" />
<img width="1895" height="952" alt="sweet3" src="https://github.com/user-attachments/assets/36e68eaf-3c83-4b55-b242-c43841f2b543" />
<img width="1907" height="957" alt="sweet4" src="https://github.com/user-attachments/assets/397efdf2-fbc2-4cd4-b970-e9eaf5d41e80" />
<img width="1890" height="920" alt="sweet5" src="https://github.com/user-attachments/assets/fda3f3aa-47d3-426f-b0be-bad6c2bbafa9" />


```




