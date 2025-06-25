import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const SALT_ROUNDS = 10;

export default function authRoutes(prisma: PrismaClient) {
  const router = Router();

  // Register endpoint
  router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }
      const hashed = await bcrypt.hash(password, SALT_ROUNDS);
      const user = await prisma.user.create({ data: { email, password: hashed } });
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '1h' });
      res.status(201).json({ token, user: { id: user.id, email: user.email, createdAt: user.createdAt } });
    } catch (err) {
      next(err);
    }
  });

  // Login endpoint
  router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return res.status(401).json({ error: 'Invalid credentials' });

      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(401).json({ error: 'Invalid credentials' });

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '1h' });
      res.json({ token, user: { id: user.id, email: user.email, createdAt: user.createdAt } });
    } catch (err) {
      next(err);
    }
  });

  return router;
}