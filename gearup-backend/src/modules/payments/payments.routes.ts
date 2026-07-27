import { Router, Request, Response, NextFunction } from 'express';
import {
  createPayment,
  confirmPayment,
  stripeWebhook,
  myPayments,
  getPayment,
} from './payments.controller';
import { validate } from '../../middlewares/validate';
import { createPaymentSchema } from './payments.validation';
import { auth } from '../../middlewares/auth';

// Webhook needs raw body. We mount a separate mini-router for it.
const router = Router();

router.post('/create', auth, validate(createPaymentSchema), createPayment);
router.post('/confirm', confirmPayment); // also handles browser redirect from success_url
router.get('/confirm', confirmPayment);
router.get('/', auth, myPayments);
router.get('/:id', auth, getPayment);

// Stripe webhook mounted under /webhook
export const stripeWebhookRouter = Router();
stripeWebhookRouter.post(
  '/stripe',
  (req: Request, _res: Response, next: NextFunction) => {
    (req as unknown as { rawBody: Buffer }).rawBody = req.body as Buffer;
    next();
  },
  stripeWebhook
);

export const paymentsRouter = router;
