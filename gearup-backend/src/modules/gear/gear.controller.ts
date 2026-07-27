import { Request, Response, NextFunction } from 'express';
import prisma from '../../config/db';
import { notFound } from '../../utils/ApiError';
import { sendSuccess } from '../../utils/sendResponse';
import { GearQuery } from './gear.validation';

export const listGear = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const q = req.query as unknown as GearQuery;
    const {
      category, brand, minPrice, maxPrice, available, search,
      page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc',
    } = q;

    const where: Record<string, unknown> = {};
    if (category) where.category = { slug: category };
    if (brand) where.brand = { equals: brand, mode: 'insensitive' };
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.pricePerDay = {
        ...(minPrice !== undefined ? { gte: minPrice } : {}),
        ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
      };
    }
    if (available !== undefined) where.isAvailable = available;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      prisma.gearItem.findMany({
        where,
        include: { category: { select: { id: true, name: true, slug: true } }, provider: { select: { id: true, name: true } } },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.gearItem.count({ where }),
    ]);

    sendSuccess(res, {
      data: items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

export const getGear = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const item = await prisma.gearItem.findUnique({
      where: { id: req.params.id },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        provider: { select: { id: true, name: true } },
        reviews: {
          select: { id: true, rating: true, comment: true, createdAt: true, user: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });
    if (!item) throw notFound('Gear not found');
    sendSuccess(res, { data: item });
  } catch (err) {
    next(err);
  }
};
