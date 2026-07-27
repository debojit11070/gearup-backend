import { z } from 'zod';

export const gearQuerySchema = z.object({
  category: z.string().optional(),
  brand: z.string().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  available: z.coerce.boolean().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  sortBy: z.enum(['pricePerDay', 'createdAt', 'name']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const createGearSchema = z.object({
  name: z.string().trim().min(2).max(150),
  description: z.string().trim().min(5).max(2000),
  brand: z.string().trim().min(1).max(80),
  pricePerDay: z.number().positive('Price must be positive'),
  stock: z.number().int().nonnegative().default(1),
  isAvailable: z.boolean().default(true),
  images: z.array(z.string().url()).max(10).default([]),
  specifications: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
  categoryId: z.string().min(1),
});

export const updateGearSchema = createGearSchema.partial();

export type GearQuery = z.infer<typeof gearQuerySchema>;
export type CreateGearInput = z.infer<typeof createGearSchema>;
export type UpdateGearInput = z.infer<typeof updateGearSchema>;
