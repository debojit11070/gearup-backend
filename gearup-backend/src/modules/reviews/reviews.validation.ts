import { z } from 'zod';

export const createReviewSchema = z.object({
  gearItemId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(2).max(1000),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
