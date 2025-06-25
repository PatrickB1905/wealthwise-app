import { Request, Response, NextFunction } from 'express';
import { expressjwt } from 'express-jwt';
import dotenv from 'dotenv';

dotenv.config();

export const authenticate = expressjwt({
  secret: process.env.JWT_SECRET!,
  algorithms: ['HS256'],
  requestProperty: 'auth',
});

declare global {
  namespace Express {
    interface Request {
      auth?: { userId: number; iat: number; exp: number };
    }
  }
}

export function authErrorHandler(
  err: any,
  _req: Request,
  res: Response,
  next: NextFunction
) {
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'Invalid or missing token' });
  }
  next(err);
}