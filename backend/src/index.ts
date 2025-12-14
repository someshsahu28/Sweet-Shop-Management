import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import sweetsRoutes from './routes/sweets';
import { prisma } from './database/prisma';

dotenv.config();

export const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sweets', sweetsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
if (require.main === module) {
  app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    // Test database connection
    try {
      await prisma.$connect();
      console.log('✅ Connected to PostgreSQL database');
    } catch (error) {
      console.error('❌ Database connection error:', error);
    }
  });
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

