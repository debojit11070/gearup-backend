import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../../config/db';
import { signToken } from '../../utils/jwt';
import { badRequest, conflict, notFound, unauthorized } from '../../utils/ApiError';
import { RegisterInput, LoginInput } from './auth.validation';
import { sendSuccess } from '../../utils/sendResponse';

const sanitizeUser = <T extends { password: string }>(u: T) => {
  const { password, ...rest } = u;
  return rest;
};

export const register = async (
  req: Request<{}, {}, RegisterInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password, role, phone, address } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw conflict('Email already registered');

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role, phone, address },
    });

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    sendSuccess(res, {
      statusCode: 201,
      message: 'User registered successfully',
      data: { token, user: sanitizeUser(user) },
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (
  req: Request<{}, {}, LoginInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw unauthorized('Invalid credentials');
    if (user.status === 'SUSPENDED') {
      throw unauthorized('Your account is suspended. Contact support.');
    }
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw unauthorized('Invalid credentials');

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    sendSuccess(res, {
      message: 'Login successful',
      data: { token, user: sanitizeUser(user) },
    });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw unauthorized();
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) throw notFound('User not found');
    sendSuccess(res, { data: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
};
