import { Router } from 'express';
import {
  createRental,
  myRentals,
  getRental,
  updateRentalStatus,
  providerOrders,
} from './rentals.controller';
import { validate } from '../../middlewares/validate';
import { createRentalSchema, updateRentalStatusSchema } from './rentals.validation';
import { auth, requireRole } from '../../middlewares/auth';

const router = Router();

router.use(auth);

router.post('/', requireRole('CUSTOMER'), validate(createRentalSchema), createRental);
router.get('/', myRentals);
router.get('/provider/orders', requireRole('PROVIDER'), providerOrders);
router.get('/:id', getRental);
router.patch('/:id', validate(updateRentalStatusSchema), updateRentalStatus);

export const rentalsRouter = router;
