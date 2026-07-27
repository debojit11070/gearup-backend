import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { authRouter } from './modules/auth/auth.routes';
import { gearRouter } from './modules/gear/gear.routes';
import { categoriesRouter } from './modules/categories/categories.routes';
import { rentalsRouter } from './modules/rentals/rentals.routes';
import { paymentsRouter } from './modules/payments/payments.routes';
import { reviewsRouter } from './modules/reviews/reviews.routes';
import { providerRouter } from './modules/provider/provider.routes';
import { adminRouter } from './modules/admin/admin.routes';
import { errorHandler, notFoundHandler } from './middlewares/error';
import { sendSuccess } from './utils/sendResponse';
import { stripeWebhook } from './modules/payments/payments.controller';

export const createApp = (): Application => {
  const app = express();

  app.use(cors());

  // Stripe webhook needs raw body - register before json parser
  app.post(
    '/api/payments/webhook/stripe',
    express.raw({ type: 'application/json' }),
    stripeWebhook
  );

  app.get('/', (_req: Request, res: Response) => {
    sendSuccess(res, {
      message: 'Welcome to the GearUp API 🏋️',
      data: {
        name: 'GearUp Backend',
        version: '1.0.0',
        docs: '/api/health',
      },
    });
  });

  app.get('/api/health', (_req, res) => {
    sendSuccess(res, { message: 'OK', data: { uptime: process.uptime() } });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/gear', gearRouter);
  app.use('/api/categories', categoriesRouter);
  app.use('/api/rentals', rentalsRouter);
  app.use('/api/payments', paymentsRouter);
  app.use('/api/reviews', reviewsRouter);
  app.use('/api/provider', providerRouter);
  app.use('/api/admin', adminRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
