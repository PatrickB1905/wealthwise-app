import { Router, Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import { authenticate, authErrorHandler } from '../middleware/auth';

const SALT_ROUNDS = 10;

export default function authRoutes(prisma: Prisma) {
  const router = Router();

  router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { firstName, lastName, email, password } = req.body;
      if (!firstName || !lastName || !email || !password) {
        return res
          .status(400)
          .json({ error: 'First name, last name, email and password are required.' });
      }
      if (!validator.isEmail(email)) {
        return res
          .status(400)
          .json({ error: 'Please enter a valid email address.' });
      }
      const hashed = await bcrypt.hash(password, SALT_ROUNDS);
      const user = await prisma.user.create({
        data: { firstName, lastName, email, password: hashed },
      });
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '1h' });
      return res.status(201).json({
        token,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          createdAt: user.createdAt,
        },
      });
    } catch (err: any) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002' &&
        Array.isArray(err.meta?.target) &&
        (err.meta.target as string[]).includes('email')
      ) {
        return res
          .status(409)
          .json({ error: 'That email is already registered. Please log in or choose another.' });
      }
      next(err);
    }
  });

  router.post('/login', async (req, res, next) => {
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

  router.get(
    '/me',
    authenticate,
    authErrorHandler,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = req.auth!.userId;
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            createdAt: true
          }
        });
        res.json(user);
      } catch (err) {
        next(err);
      }
    }
  );

  router.put(
    '/me/email',
    authenticate,
    authErrorHandler,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = req.auth!.userId;
        const { email } = req.body;
        if (!email) {
          return res.status(400).json({ error: 'Email is required' });
        }
        const updated = await prisma.user.update({
          where: { id: userId },
          data: { email },
        });
        return res.json({ email: updated.email });
      } catch (err: any) {
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === 'P2002' &&
          Array.isArray(err.meta?.target) &&
          (err.meta.target as string[]).includes('email')
        ) {
          return res.status(409).json({ error: 'The following email is already in use.' });
        }
        next(err);
      }
    }
  );

  router.put(
    '/me/password',
    authenticate,
    authErrorHandler,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = req.auth!.userId;
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
          return res.status(400).json({ error: 'Current and new password are required' });
        }
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const match = await bcrypt.compare(currentPassword, user.password);
        if (!match) return res.status(400).json({ error: 'Current password incorrect' });

        const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
        await prisma.user.update({
          where: { id: userId },
          data: { password: hashed },
        });
        res.json({ message: 'Password updated' });
      } catch (err) {
        next(err);
      }
    }
  );

  router.delete(
    '/me',
    authenticate,
    authErrorHandler,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = req.auth!.userId;
        await prisma.position.deleteMany({ where: { userId } });
        await prisma.user.delete({ where: { id: userId } });
        res.status(204).end();
      } catch (err) {
        next(err);
      }
    }
  );

  return router;
}