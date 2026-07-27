import { z } from 'zod';

export const createPaymentSchema = z.object({
  rentalOrderId: z.string().min(1),
  method: z.enum(['STRIPE', 'SSLCOMMERZ']).default('STRIPE'),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
