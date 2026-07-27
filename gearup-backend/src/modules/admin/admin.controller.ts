import { Request, Response, NextFunction } from 'express';
import prisma from '../../config/db';
import { badRequest, notFound } from '../../utils/ApiError';
import { sendSuccess } from '../../utils/sendResponse';

export const listUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const role = req.query.role as string | undefined;
    const where = role ? { role: role as 'CUSTOMER' | 'PROVIDER' | 'ADMIN' } : {};
    const data = await prisma.user.findMany({
      where,
      select: {
        id: true, name: true, email: true, role: true, status: true,
        phone: true, address: true, createdAt: true, updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    sendSuccess(res, { data });
  } catch (err) { next(err); }
};

export const updateUserStatus = async (
  req: Request<{ id: string }, {}, { status: 'ACTIVE' | 'SUSPENDED' }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) throw notFound('User not found');
    if (user.role === 'ADMIN') throw badRequest('Cannot change admin status');
    const data = await prisma.user.update({
      where: { id: req.params.id },
      data: { status: req.body.status },
      select: { id: true, name: true, email: true, role: true, status: true },
    });
    sendSuccess(res, { message: 'User status updated', data });
  } catch (err) { next(err); }
};

export const adminListGear = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await prisma.gearItem.findMany({
      include: {
        provider: { select: { id: true, name: true, email: true } },
        category: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    sendSuccess(res, { data });
  } catch (err) { next(err); }
};

export const adminListRentals = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await prisma.rentalOrder.findMany({
      include: {
        items: { include: { gearItem: { select: { id: true, name: true } } } },
        customer: { select: { id: true, name: true, email: true } },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    sendSuccess(res, { data });
  } catch (err) { next(err); }
};

export const adminStats = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [users, providers, customers, gear, orders, paidOrders, revenue] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'PROVIDER' } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.gearItem.count(),
      prisma.rentalOrder.count(),
      prisma.rentalOrder.count({ where: { status: 'PAID' } }),
      prisma.payment.aggregate({ where: { status: 'COMPLETED' }, _sum: { amount: true } }),
    ]);
    sendSuccess(res, {
      data: {
        users, providers, customers, gear, orders, paidOrders,
        revenue: revenue._sum.amount || 0,
      },
    });
  } catch (err) { next(err); }
};
