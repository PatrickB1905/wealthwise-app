import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

interface AuthRequest extends Request {
  auth?: { userId: number };
}

export default function positionsRoutes(prisma: PrismaClient) {
  const router = Router();

  router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.auth!.userId;
      const status = (req.query.status as string) || 'open';
      const positions = await prisma.position.findMany({
        where: {
          userId,
          ...(status === 'open'
            ? { sellDate: null }
            : { sellDate: { not: null } })
        },
        orderBy: { buyDate: 'desc' }
      });
      res.json(positions);
    } catch (err) {
      next(err);
    }
  });

  router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.auth!.userId;
      const { ticker, quantity, buyPrice } = req.body;
      if (!ticker || !quantity || !buyPrice) {
        return res.status(400).json({ error: 'ticker, quantity and buyPrice are required' });
      }
      const position = await prisma.position.create({
        data: { userId, ticker, quantity: Number(quantity), buyPrice: Number(buyPrice) }
      });
      res.status(201).json(position);
    } catch (err) {
      next(err);
    }
  });

  router.put('/:id/close', async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.auth!.userId;
      const id = Number(req.params.id);
      const { sellPrice } = req.body;
      if (!sellPrice) {
        return res.status(400).json({ error: 'sellPrice is required' });
      }
      const existing = await prisma.position.findUnique({ where: { id } });
      if (!existing || existing.userId !== userId || existing.sellDate) {
        return res.status(404).json({ error: 'Position not found or already closed' });
      }
      const updated = await prisma.position.update({
        where: { id },
        data: {
          sellPrice: Number(sellPrice),
          sellDate: new Date()
        }
      });
      res.json(updated);
    } catch (err) {
      next(err);
    }
  });

  return router;
}