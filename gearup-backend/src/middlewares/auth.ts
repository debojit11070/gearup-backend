import { Request, Response, NextFunction, RequestHandler } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';
import { unauthorized, forbidden } from '../utils/ApiError';
import { Role, UserStatus } from '@prisma/client';
import prisma from '../config/db';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & { status: UserStatus };
    }
  }
}

export const auth: RequestHandler = (req: Request, _res: Response, next: NextFunction) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw unauthorized('Missing or invalid Authorization header');
    }
    const token = header.split(' ')[1];
    if (!token) throw unauthorized('Token missing');

    const payload = verifyToken(token);
    req.user = payload as JwtPayload & { status: UserStatus };
    next();
  } catch (err) {
    if (err instanceof Error && err.name === 'JsonWebTokenError') {
      next(unauthorized('Invalid token'));
      return;
    }
    if (err instanceof Error && err.name === 'TokenExpiredError') {
      next(unauthorized('Token expired'));
      return;
    }
    next(err);
  }
};

export const requireRole = (...roles: Role[]): RequestHandler => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw unauthorized();
      if (!roles.includes(req.user.role)) {
        throw forbidden(`Access denied. Required role: ${roles.join(' or ')}`);
      }
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { status: true },
      });
      if (!user) throw unauthorized('User no longer exists');
      if (user.status === 'SUSPENDED') {
        throw forbidden('Your account is suspended');
      }
      next();
    } catch (err) {
      next(err);
    }
  };
};
