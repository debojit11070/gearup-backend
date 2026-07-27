import { Router } from 'express';
import {
  createPayment,
  confirmPayment,
  myPayments,
  getPayment,
} from './payments.controller';
import { validate } from '../../middlewares/validate';
import { createPaymentSchema } from './payments.validation';
import { auth } from '../../middlewares/auth';

const router = Router();

router.post('/create', auth, validate(createPaymentSchema), createPayment);
router.post('/confirm', confirmPayment);
router.get('/confirm', confirmPayment);
router.get('/', auth, myPayments);
router.get('/:id', auth, getPayment);

export const paymentsRouter = router;
