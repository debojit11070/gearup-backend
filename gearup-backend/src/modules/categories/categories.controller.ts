import { Request, Response, NextFunction } from 'express';
import prisma from '../../config/db';
import { conflict, notFound } from '../../utils/ApiError';
import { sendSuccess } from '../../utils/sendResponse';
import { CreateCategoryInput, UpdateCategoryInput } from './categories.validation';

export const listCategories = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await prisma.category.findMany({ orderBy: { name: 'asc' } });
    sendSuccess(res, { data });
  } catch (err) {
    next(err);
  }
};

export const createCategory = async (
  req: Request<{}, {}, CreateCategoryInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, slug } = req.body;
    const exists = await prisma.category.findFirst({
      where: { OR: [{ name }, { slug }] },
    });
    if (exists) throw conflict('Category with this name or slug already exists');
    const data = await prisma.category.create({ data: { name, slug } });
    sendSuccess(res, { statusCode: 201, message: 'Category created', data });
  } catch (err) {
    next(err);
  }
};

export const updateCategory = async (
  req: Request<{ id: string }, {}, UpdateCategoryInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const existing = await prisma.category.findUnique({ where: { id: req.params.id } });
    if (!existing) throw notFound('Category not found');
    const data = await prisma.category.update({
      where: { id: req.params.id },
      data: req.body,
    });
    sendSuccess(res, { message: 'Category updated', data });
  } catch (err) {
    next(err);
  }
};

export const deleteCategory = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const existing = await prisma.category.findUnique({ where: { id: req.params.id } });
    if (!existing) throw notFound('Category not found');
    await prisma.category.delete({ where: { id: req.params.id } });
    sendSuccess(res, { message: 'Category deleted' });
  } catch (err) {
    next(err);
  }
};
