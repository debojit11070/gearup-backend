import { Router } from 'express';
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from './categories.controller';
import { validate } from '../../middlewares/validate';
import { createCategorySchema, updateCategorySchema } from './categories.validation';
import { auth } from '../../middlewares/auth';
import { requireRole } from '../../middlewares/auth';

const router = Router();

router.get('/', listCategories);
router.post('/', auth, requireRole('ADMIN'), validate(createCategorySchema), createCategory);
router.put('/:id', auth, requireRole('ADMIN'), validate(updateCategorySchema), updateCategory);
router.delete('/:id', auth, requireRole('ADMIN'), deleteCategory);

export const categoriesRouter = router;
