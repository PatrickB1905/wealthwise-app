import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { Server as SocketIOServer } from 'socket.io';

interface AuthRequest extends Request {
  auth?: { userId: number };
}

export default function positionsRoutes(prisma: PrismaClient) {
  const router = Router();

  router.get(
    '/',
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        const userId = req.auth!.userId;
        const status = (req.query.status as string) || 'open';
        const positions = await prisma.position.findMany({
          where: {
            userId,
            ...(status === 'open'
              ? { sellDate: null }
              : { sellDate: { not: null } }),
          },
          orderBy: { buyDate: 'desc' },
        });
        res.json(positions);
      } catch (err) {
        next(err);
      }
    }
  );

  router.post(
    '/',
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        const userId = req.auth!.userId;
        const { ticker, quantity, buyPrice } = req.body;
        if (!ticker || quantity == null || buyPrice == null) {
          return res
            .status(400)
            .json({ error: 'ticker, quantity and buyPrice are required' });
        }

        const position = await prisma.position.create({
          data: {
            userId,
            ticker,
            quantity: Number(quantity),
            buyPrice: Number(buyPrice),
          },
        });

        const io: SocketIOServer = req.app.locals.io;
        io.to(`user_${userId}`).emit('position:added', position);

        res.status(201).json(position);
      } catch (err) {
        next(err);
      }
    }
  );

  router.put(
    '/:id/close',
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        const userId = req.auth!.userId;
        const id = Number(req.params.id);
        const { sellPrice } = req.body;
        if (sellPrice == null) {
          return res.status(400).json({ error: 'sellPrice is required' });
        }

        const existing = await prisma.position.findUnique({ where: { id } });
        if (!existing || existing.userId !== userId || existing.sellDate) {
          return res
            .status(404)
            .json({ error: 'Position not found or already closed' });
        }

        const updated = await prisma.position.update({
          where: { id },
          data: {
            sellPrice: Number(sellPrice),
            sellDate: new Date(),
          },
        });

        const io: SocketIOServer = req.app.locals.io;
        io.to(`user_${userId}`).emit('position:closed', updated);

        res.json(updated);
      } catch (err) {
        next(err);
      }
    }
  );

  router.put(
    '/:id',
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        const userId = req.auth!.userId;
        const id = Number(req.params.id);
        const { quantity, buyPrice, sellPrice } = req.body;

        if (quantity == null || buyPrice == null) {
          return res
            .status(400)
            .json({ error: 'quantity and buyPrice are required' });
        }

        const existing = await prisma.position.findUnique({ where: { id } });
        if (!existing || existing.userId !== userId) {
          return res.status(404).json({ error: 'Position not found' });
        }

        const updated = await prisma.position.update({
          where: { id },
          data: {
            quantity: Number(quantity),
            buyPrice:  Number(buyPrice),
            ...(sellPrice != null
              ? { sellPrice: Number(sellPrice) }
              : {}),
          },
        });

        const io: SocketIOServer = req.app.locals.io;
        io.to(`user_${userId}`).emit('position:updated', updated);

        res.json(updated);
      } catch (err) {
        next(err);
      }
    }
  );

  router.delete(
    '/:id',
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        const userId = req.auth!.userId;
        const id = Number(req.params.id);

        const existing = await prisma.position.findUnique({ where: { id } });
        if (!existing || existing.userId !== userId) {
          return res.status(404).json({ error: 'Position not found' });
        }

        await prisma.position.delete({ where: { id } });

        const io: SocketIOServer = req.app.locals.io;
        io.to(`user_${userId}`).emit('position:deleted', { id });

        res.status(204).end();
      } catch (err) {
        next(err);
      }
    }
  );

  return router;
}