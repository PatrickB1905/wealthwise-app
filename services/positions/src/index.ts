import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { startPricePolling } from './pricePoller';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth';
import positionsRoutes from './routes/positions';
import { authenticate, authErrorHandler } from './middleware/auth';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'OK', uptime: process.uptime() });
});

app.use('/api/auth', authRoutes(prisma));

app.use(
  '/api/positions',
  authenticate,
  authErrorHandler,
  positionsRoutes(prisma)
);

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message });
});

const httpServer = http.createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  },
});

startPricePolling(prisma, io);

io.on('connection', (socket) => {
  socket.on('join', (userId: number) => {
    socket.join(`user_${userId}`);
  });
});

app.locals.io = io;

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`Positions service + WS running on port ${PORT}`);
});