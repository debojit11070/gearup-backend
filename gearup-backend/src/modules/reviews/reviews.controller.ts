import { Request, Response, NextFunction } from 'express';
import prisma from '../../config/db';
import { badRequest, forbidden, notFound } from '../../utils/ApiError';
import { sendSuccess } from '../../utils/sendResponse';
import { CreateReviewInput } from './reviews.validation';

export const createReview = async (
  req: Request<{}, {}, CreateReviewInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw forbidden();
    const { gearItemId, rating, comment } = req.body;

    const gear = await prisma.gearItem.findUnique({ where: { id: gearItemId } });
    if (!gear) throw notFound('Gear not found');

    // Only allow review if user has a RETURNED rental of this gear
    const order = await prisma.rentalOrder.findFirst({
      where: {
        customerId: req.user.id,
        status: 'RETURNED',
        items: { some: { gearItemId } },
      },
    });
    if (!order) {
      throw badRequest('You can only review gear from a returned rental');
    }

    const existing = await prisma.review.findUnique({
      where: { userId_gearItemId: { userId: req.user.id, gearItemId } },
    });
    if (existing) throw badRequest('You have already reviewed this gear');

    const data = await prisma.review.create({
      data: { gearItemId, rating, comment, userId: req.user.id },
    });
    sendSuccess(res, { statusCode: 201, message: 'Review submitted', data });
  } catch (err) {
    next(err);
  }
};

export const gearReviews = async (
  req: Request<{ gearItemId: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await prisma.review.findMany({
      where: { gearItemId: req.params.gearItemId },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    sendSuccess(res, { data });
  } catch (err) {
    next(err);
  }
};
