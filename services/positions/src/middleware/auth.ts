import type { ErrorRequestHandler } from 'express'
import { Request, Response, NextFunction } from 'express'
import { expressjwt } from 'express-jwt'
import dotenv from 'dotenv'
import { ENV } from '../config/env'

dotenv.config()

type JwtAuth = { userId: number; iat?: number; exp?: number }

declare global {
  namespace Express {
    interface Request {
      auth?: JwtAuth
    }
  }
}

export const authenticate = expressjwt({
  secret: ENV.JWT_SECRET,
  algorithms: ['HS256'],
  requestProperty: 'auth',
})

export const authErrorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  if (err?.name === 'UnauthorizedError') {
    res.status(401).json({ error: 'Invalid or missing token' })
    return
  }
  next(err)
}
