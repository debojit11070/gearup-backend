import { Request, Response, NextFunction } from 'express';
import Stripe from 'stripe';
import prisma from '../../config/db';
import { stripe, isStripeConfigured } from './stripe';
import { config } from '../../config';
import { badRequest, forbidden, notFound } from '../../utils/ApiError';
import { sendSuccess } from '../../utils/sendResponse';
import { CreatePaymentInput } from './payments.validation';

export const createPayment = async (
  req: Request<{}, {}, CreatePaymentInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw forbidden();
    const { rentalOrderId, method } = req.body;

    const order = await prisma.rentalOrder.findUnique({
      where: { id: rentalOrderId },
      include: { payment: true },
    });
    if (!order) throw notFound('Rental order not found');
    if (order.customerId !== req.user.id) throw forbidden('Not your order');
    if (order.status === 'CANCELLED') throw badRequest('Order is cancelled');
    if (order.payment && order.payment.status === 'COMPLETED') {
      throw badRequest('Order already paid');
    }

    if (method === 'STRIPE') {
      if (!isStripeConfigured()) {
        throw badRequest('Stripe is not configured on the server');
      }
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: { name: `GearUp Rental Order #${order.id.slice(-8)}` },
              unit_amount: Math.round(order.totalAmount * 100),
            },
            quantity: 1,
          },
        ],
        success_url: `${config.baseUrl}/api/payments/confirm?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${config.baseUrl}/api/payments/cancel`,
        metadata: { orderId: order.id, userId: req.user.id },
      });

      // Create or update pending payment record
      const payment = order.payment
        ? await prisma.payment.update({
            where: { id: order.payment.id },
            data: {
              amount: order.totalAmount,
              method: 'STRIPE',
              provider: 'stripe',
              status: 'PENDING',
              transactionId: session.id,
            },
          })
        : await prisma.payment.create({
            data: {
              rentalOrderId: order.id,
              userId: req.user.id,
              amount: order.totalAmount,
              method: 'STRIPE',
              provider: 'stripe',
              status: 'PENDING',
              transactionId: session.id,
            },
          });

      sendSuccess(res, {
        statusCode: 201,
        message: 'Stripe checkout session created',
        data: { payment, checkoutUrl: session.url, sessionId: session.id },
      });
      return;
    }

    if (method === 'SSLCOMMERZ') {
      // SSLCommerz integration placeholder: a real integration would POST to
      // https://sandbox.sslcommerz.com/gwprocess/v4/api.php and return a Gateway URL.
      throw badRequest('SSLCommerz integration is not yet implemented. Please use Stripe.');
    }
  } catch (err) {
    next(err);
  }
};

export const confirmPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionId = (req.query.session_id as string) || (req.body?.sessionId as string);
    if (!sessionId) throw badRequest('session_id is required');

    if (!isStripeConfigured()) throw badRequest('Stripe is not configured');

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid') {
      throw badRequest('Payment not completed');
    }

    const orderId = session.metadata?.orderId;
    if (!orderId) throw badRequest('Missing orderId in session metadata');

    const payment = await prisma.payment.findFirst({ where: { transactionId: sessionId } });
    if (!payment) throw notFound('Payment record not found');

    const updated = await prisma.$transaction(async (tx) => {
      const p = await tx.payment.update({
        where: { id: payment.id },
        data: { status: 'COMPLETED', paidAt: new Date(), rawResponse: session as unknown as object },
      });
      await tx.rentalOrder.update({
        where: { id: orderId },
        data: { status: 'PAID' },
      });
      return p;
    });

    // For a browser redirect success_url, return a friendly HTML page.
    res.setHeader('Content-Type', 'text/html');
    res.send(
      `<html><body style="font-family:sans-serif;padding:40px;"><h2>Payment successful ✅</h2><p>Payment ID: ${updated.id}</p><p>Order ID: ${orderId}</p><p>You can close this window.</p></body></html>`
    );
  } catch (err) {
    next(err);
  }
};

export const stripeWebhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!isStripeConfigured()) throw badRequest('Stripe is not configured');
    const sig = req.headers['stripe-signature'];
    if (!sig) throw badRequest('Missing stripe-signature header');

    let event: Stripe.Event;
    try {
      const rawBody =
        (req as unknown as { rawBody?: Buffer }).rawBody ??
        (typeof req.body === 'string'
          ? Buffer.from(req.body)
          : Buffer.from(JSON.stringify(req.body)));
      event = stripe.webhooks.constructEvent(
        rawBody,
        sig,
        config.stripeWebhookSecret
      );
    } catch (err) {
      throw badRequest(`Webhook signature verification failed: ${(err as Error).message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;
      if (orderId) {
        const payment = await prisma.payment.findFirst({ where: { transactionId: session.id } });
        if (payment) {
          await prisma.$transaction(async (tx) => {
            await tx.payment.update({
              where: { id: payment.id },
              data: { status: 'COMPLETED', paidAt: new Date(), rawResponse: session as unknown as object },
            });
            await tx.rentalOrder.update({ where: { id: orderId }, data: { status: 'PAID' } });
          });
        }
      }
    }

    res.json({ received: true });
  } catch (err) {
    next(err);
  }
};

export const myPayments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw forbidden();
    const data = await prisma.payment.findMany({
      where: { userId: req.user.id },
      include: { rentalOrder: { select: { id: true, status: true, totalAmount: true } } },
      orderBy: { createdAt: 'desc' },
    });
    sendSuccess(res, { data });
  } catch (err) {
    next(err);
  }
};

export const getPayment = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw forbidden();
    const payment = await prisma.payment.findUnique({
      where: { id: req.params.id },
      include: { rentalOrder: true },
    });
    if (!payment) throw notFound('Payment not found');
    if (payment.userId !== req.user.id && req.user.role !== 'ADMIN') {
      throw forbidden('Not allowed');
    }
    sendSuccess(res, { data: payment });
  } catch (err) {
    next(err);
  }
};
