import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth';

dotenv.config();
const app = express();
const prisma = new PrismaClient();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// Health check
app.get('/api/health', (_: Request, res: Response) =>
  res.json({ status: 'OK', uptime: process.uptime() }),
);

// Auth routes
app.use('/api/auth', authRoutes(prisma));

// Global error handler
app.use((err: any, _: Request, res: Response, __: NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Positions service listening on port ${port}`);
});