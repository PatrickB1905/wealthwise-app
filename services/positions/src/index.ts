import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { PrismaClient } from '@prisma/client';

import { startPricePolling } from './pricePoller';
import authRoutes from './routes/auth';
import positionsRoutes from './routes/positions';
import { authenticate, authErrorHandler } from './middleware/auth';
import { ENV } from './config/env';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(
  cors({
    origin: ENV.FRONTEND_ORIGIN,
    credentials: true,
  })
);

app.use(express.json());

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'OK', uptime: process.uptime() });
});

app.use('/api/auth', authRoutes(prisma));

app.use('/api/positions', authenticate, authErrorHandler, positionsRoutes(prisma));

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[positions] unhandled error:', err);
  res.status(err?.status ?? 500).json({ error: 'Internal server error' });
});

const httpServer = http.createServer(app);

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: ENV.FRONTEND_ORIGIN,
    credentials: true,
  },
});

app.locals.io = io;

io.on('connection', (socket) => {
  socket.on('join', (userId: number) => {
    socket.join(`user_${userId}`);
  });
});

const PORT = ENV.PORT;

httpServer.listen(PORT, () => {
  console.log(`Positions service + WS running on port ${PORT}`);
  startPricePolling(prisma, io);
});
