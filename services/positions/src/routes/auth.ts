import { Router } from 'express'
import type { Request, Response, NextFunction } from 'express'
import type { PrismaClient, Prisma } from '@prisma/client'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import validator from 'validator'
import { authenticate, authErrorHandler } from '../middleware/auth'


const SALT_ROUNDS = 10

function isUniqueEmailError(err: unknown): boolean {
  const e = err as Prisma.PrismaClientKnownRequestError
  return (
    e?.code === 'P2002' &&
    Array.isArray((e as any).meta?.target) &&
    ((e as any).meta.target as string[]).includes('email')
  )
}

export default function authRoutes(prisma: PrismaClient) {
  const router = Router()

  router.post('/register', async (req, res, next) => {
    try {
      const { firstName, lastName, email, password } = req.body as {
        firstName?: string
        lastName?: string
        email?: string
        password?: string
      }

      if (!firstName || !lastName || !email || !password) {
        res
          .status(400)
          .json({ error: 'First name, last name, email and password are required.' })
        return
      }

      if (!validator.isEmail(email)) {
        res.status(400).json({ error: 'Please enter a valid email address.' })
        return
      }

      const hashed = await bcrypt.hash(password, SALT_ROUNDS)
      const user = await prisma.user.create({
        data: { firstName, lastName, email, password: hashed },
      })

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET ?? '', {
        expiresIn: '1h',
      })

      res.status(201).json({
        token,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          createdAt: user.createdAt,
        },
      })
    } catch (err) {
      if (isUniqueEmailError(err)) {
        res.status(409).json({
          error: 'That email is already registered. Please log in or choose another.',
        })
        return
      }
      next(err)
    }
  })

  router.post('/login', async (req, res, next) => {
    try {
      const { email, password } = req.body as { email?: string; password?: string }

      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' })
        return
      }

      const user = await prisma.user.findUnique({ where: { email } })
      if (!user) {
        res.status(401).json({ error: 'Invalid credentials' })
        return
      }

      const match = await bcrypt.compare(password, user.password)
      if (!match) {
        res.status(401).json({ error: 'Invalid credentials' })
        return
      }

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET ?? '', {
        expiresIn: '1h',
      })

      res.json({
        token,
        user: { id: user.id, email: user.email, createdAt: user.createdAt },
      })
    } catch (err) {
      next(err)
    }
  })

  router.get('/me', authenticate, authErrorHandler, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.auth?.userId
      if (!userId) {
        res.status(401).json({ error: 'Invalid or missing token' })
        return
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          createdAt: true,
        },
      })

      res.json(user)
    } catch (err) {
      next(err)
    }
  })

  router.put('/me/email', authenticate, authErrorHandler, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.auth?.userId
      if (!userId) {
        res.status(401).json({ error: 'Invalid or missing token' })
        return
      }

      const { email } = req.body as { email?: string }
      if (!email) {
        res.status(400).json({ error: 'Email is required' })
        return
      }

      const updated = await prisma.user.update({
        where: { id: userId },
        data: { email },
      })

      res.json({ email: updated.email })
    } catch (err) {
      if (isUniqueEmailError(err)) {
        res.status(409).json({ error: 'The following email is already in use.' })
        return
      }
      next(err)
    }
  })

  router.put('/me/password', authenticate, authErrorHandler, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.auth?.userId
      if (!userId) {
        res.status(401).json({ error: 'Invalid or missing token' })
        return
      }

      const { currentPassword, newPassword } = req.body as {
        currentPassword?: string
        newPassword?: string
      }

      if (!currentPassword || !newPassword) {
        res.status(400).json({ error: 'Current and new password are required' })
        return
      }

      const user = await prisma.user.findUnique({ where: { id: userId } })
      if (!user) {
        res.status(404).json({ error: 'User not found' })
        return
      }

      const match = await bcrypt.compare(currentPassword, user.password)
      if (!match) {
        res.status(400).json({ error: 'Current password incorrect' })
        return
      }

      const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS)
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashed },
      })

      res.json({ message: 'Password updated' })
    } catch (err) {
      next(err)
    }
  })

  router.delete('/me', authenticate, authErrorHandler, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.auth?.userId
      if (!userId) {
        res.status(401).json({ error: 'Invalid or missing token' })
        return
      }

      await prisma.position.deleteMany({ where: { userId } })
      await prisma.user.delete({ where: { id: userId } })

      res.status(204).end()
    } catch (err) {
      next(err)
    }
  })

  return router
}
