import { Request, Response, NextFunction } from 'express';
import prisma from '../../config/db';
import { notFound, forbidden, badRequest } from '../../utils/ApiError';
import { sendSuccess } from '../../utils/sendResponse';
import { CreateGearInput, UpdateGearInput } from '../gear/gear.validation';

export const addGear = async (
  req: Request<{}, {}, CreateGearInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw forbidden();
    const cat = await prisma.category.findUnique({ where: { id: req.body.categoryId } });
    if (!cat) throw badRequest('Invalid categoryId');
    const data = await prisma.gearItem.create({
      data: { ...req.body, providerId: req.user.id },
    });
    sendSuccess(res, { statusCode: 201, message: 'Gear added', data });
  } catch (err) {
    next(err);
  }
};

export const updateGear = async (
  req: Request<{ id: string }, {}, UpdateGearInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw forbidden();
    const existing = await prisma.gearItem.findUnique({ where: { id: req.params.id } });
    if (!existing) throw notFound('Gear not found');
    if (existing.providerId !== req.user.id) throw forbidden('Not your gear');
    const data = await prisma.gearItem.update({
      where: { id: req.params.id },
      data: req.body,
    });
    sendSuccess(res, { message: 'Gear updated', data });
  } catch (err) {
    next(err);
  }
};

export const removeGear = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw forbidden();
    const existing = await prisma.gearItem.findUnique({ where: { id: req.params.id } });
    if (!existing) throw notFound('Gear not found');
    if (existing.providerId !== req.user.id) throw forbidden('Not your gear');
    await prisma.gearItem.delete({ where: { id: req.params.id } });
    sendSuccess(res, { message: 'Gear removed' });
  } catch (err) {
    next(err);
  }
};

export const myGear = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw forbidden();
    const data = await prisma.gearItem.findMany({
      where: { providerId: req.user.id },
      include: { category: { select: { name: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
    });
    sendSuccess(res, { data });
  } catch (err) {
    next(err);
  }
};
