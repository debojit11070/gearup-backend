import Stripe from 'stripe';
import { config } from '../../config';

export const stripe = new Stripe(config.stripeSecretKey || 'sk_test_placeholder', {
  apiVersion: '2024-10-28.acacia' as Stripe.LatestApiVersion,
});

export const isStripeConfigured = () =>
  Boolean(config.stripeSecretKey) && config.stripeSecretKey.startsWith('sk_');
