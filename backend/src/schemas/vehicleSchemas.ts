import { z } from 'zod';

export const createVehicleSchema = z.object({
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  category: z.string().min(1, 'Category is required'),
  price: z.number().positive('Price must be greater than 0'),
  quantity: z.number().int().min(0, 'Quantity cannot be negative').default(0),
});

export const updateVehicleSchema = z.object({
  make: z.string().min(1).optional(),
  model: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  price: z.number().positive('Price must be greater than 0').optional(),
  quantity: z.number().int().min(0, 'Quantity cannot be negative').optional(),
});

export const restockSchema = z.object({
  quantity: z.number().int().positive('Restock quantity must be a positive integer'),
});

export const searchQuerySchema = z.object({
  make: z.string().optional(),
  model: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
});

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;
export type RestockInput = z.infer<typeof restockSchema>;
export type SearchQueryInput = z.infer<typeof searchQuerySchema>;
