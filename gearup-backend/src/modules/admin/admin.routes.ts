import { Router } from 'express';
import {
  listUsers,
  updateUserStatus,
  adminListGear,
  adminListRentals,
  adminStats,
} from './admin.controller';
import { validate } from '../../middlewares/validate';
import { updateUserStatusSchema } from './admin.validation';
import { auth, requireRole } from '../../middlewares/auth';

const router = Router();
router.use(auth, requireRole('ADMIN'));

router.get('/stats', adminStats);
router.get('/users', listUsers);
router.patch('/users/:id', validate(updateUserStatusSchema), updateUserStatus);
router.get('/gear', adminListGear);
router.get('/rentals', adminListRentals);

export const adminRouter = router;
