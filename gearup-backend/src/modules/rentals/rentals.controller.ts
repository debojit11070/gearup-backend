import { Request, Response, NextFunction } from 'express';
import prisma from '../../config/db';
import { badRequest, forbidden, notFound } from '../../utils/ApiError';
import { sendSuccess } from '../../utils/sendResponse';
import { CreateRentalInput, UpdateRentalStatusInput } from './rentals.validation';

const daysBetween = (start: Date, end: Date) => {
  const ms = end.getTime() - start.getTime();
  return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
};

export const createRental = async (
  req: Request<{}, {}, CreateRentalInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw forbidden();
    const { startDate, endDate, items, notes } = req.body;

    const gearItems = await prisma.gearItem.findMany({
      where: { id: { in: items.map((i) => i.gearItemId) } },
    });
    if (gearItems.length !== items.length) {
      throw badRequest('One or more gear items not found');
    }
    for (const it of items) {
      const g = gearItems.find((x) => x.id === it.gearItemId)!;
      if (!g.isAvailable) throw badRequest(`Gear "${g.name}" is not available`);
      if (g.stock < it.quantity) {
        throw badRequest(`Insufficient stock for "${g.name}"`);
      }
    }

    const days = daysBetween(new Date(startDate), new Date(endDate));
    let total = 0;
    const orderItemsData = items.map((it) => {
      const g = gearItems.find((x) => x.id === it.gearItemId)!;
      const lineTotal = g.pricePerDay * it.quantity * days;
      total += lineTotal;
      return {
        gearItemId: g.id,
        quantity: it.quantity,
        pricePerDay: g.pricePerDay,
        days,
      };
    });

    const order = await prisma.rentalOrder.create({
      data: {
        customerId: req.user.id,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        totalAmount: total,
        notes,
        items: { create: orderItemsData },
      },
      include: { items: true },
    });

    sendSuccess(res, { statusCode: 201, message: 'Rental order placed', data: order });
  } catch (err) {
    next(err);
  }
};

export const myRentals = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw forbidden();
    const data = await prisma.rentalOrder.findMany({
      where: { customerId: req.user.id },
      include: {
        items: { include: { gearItem: { select: { id: true, name: true, images: true } } } },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    sendSuccess(res, { data });
  } catch (err) {
    next(err);
  }
};

export const getRental = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw forbidden();
    const order = await prisma.rentalOrder.findUnique({
      where: { id: req.params.id },
      include: {
        items: { include: { gearItem: true } },
        payment: true,
        customer: { select: { id: true, name: true, email: true } },
      },
    });
    if (!order) throw notFound('Rental order not found');

    // Only customer, provider of one of the items, or admin can view
    const isCustomer = order.customerId === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';
    let isProvider = false;
    if (req.user.role === 'PROVIDER') {
      isProvider = order.items.some(
        (it) => it.gearItem.providerId === req.user!.id
      );
    }
    if (!isCustomer && !isAdmin && !isProvider) throw forbidden('Not allowed');

    sendSuccess(res, { data: order });
  } catch (err) {
    next(err);
  }
};

export const updateRentalStatus = async (
  req: Request<{ id: string }, {}, UpdateRentalStatusInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw forbidden();
    const order = await prisma.rentalOrder.findUnique({
      where: { id: req.params.id },
      include: { items: { include: { gearItem: true } } },
    });
    if (!order) throw notFound('Rental order not found');

    if (req.user.role === 'CUSTOMER') {
      if (order.customerId !== req.user.id) throw forbidden('Not your order');
      if (req.body.status !== 'CANCELLED') {
        throw forbidden('Customers can only cancel orders');
      }
      if (!['PLACED', 'CONFIRMED'].includes(order.status)) {
        throw badRequest('Order can no longer be cancelled');
      }
    } else if (req.user.role === 'PROVIDER') {
      const owns = order.items.some((it) => it.gearItem.providerId === req.user!.id);
      if (!owns) throw forbidden('Not your order');
    }

    const data = await prisma.rentalOrder.update({
      where: { id: req.params.id },
      data: { status: req.body.status },
    });
    sendSuccess(res, { message: 'Status updated', data });
  } catch (err) {
    next(err);
  }
};

export const providerOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw forbidden();
    const data = await prisma.rentalOrder.findMany({
      where: { items: { some: { gearItem: { providerId: req.user.id } } } },
      include: {
        items: { include: { gearItem: { select: { id: true, name: true, providerId: true } } } },
        customer: { select: { id: true, name: true, email: true } },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    sendSuccess(res, { data });
  } catch (err) {
    next(err);
  }
};
