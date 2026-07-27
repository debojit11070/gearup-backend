import { z } from 'zod';

export const createRentalSchema = z.object({
  startDate: z.coerce.date({ invalid_type_error: 'Invalid startDate' }),
  endDate: z.coerce.date({ invalid_type_error: 'Invalid endDate' }),
  notes: z.string().trim().max(500).optional(),
  items: z
    .array(
      z.object({
        gearItemId: z.string().min(1),
        quantity: z.number().int().positive().default(1),
      })
    )
    .min(1, 'At least one item is required'),
}).refine((d) => d.endDate > d.startDate, {
  message: 'endDate must be after startDate',
  path: ['endDate'],
});

export const updateRentalStatusSchema = z.object({
  status: z.enum(['CONFIRMED', 'PICKED_UP', 'RETURNED', 'CANCELLED']),
});

export type CreateRentalInput = z.infer<typeof createRentalSchema>;
export type UpdateRentalStatusInput = z.infer<typeof updateRentalStatusSchema>;
