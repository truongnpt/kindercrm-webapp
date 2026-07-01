import { z } from 'zod';

export const CreateStockCountSchema = z.object({
  schoolId: z.string().uuid(),
  title: z.string().min(1).max(200),
  countDate: z.string().min(1),
  notes: z.string().max(1000).optional().or(z.literal('')),
});

export const UpsertStockCountItemSchema = z.object({
  schoolId: z.string().uuid(),
  stockCountId: z.string().uuid(),
  productId: z.string().uuid(),
  countedQuantity: z.coerce.number().min(0),
});

export const CompleteStockCountSchema = z.object({
  schoolId: z.string().uuid(),
  stockCountId: z.string().uuid(),
});

export const TransferStockSchema = z.object({
  schoolId: z.string().uuid(),
  fromProductId: z.string().uuid(),
  toProductId: z.string().uuid(),
  quantity: z.coerce.number().positive(),
  transactionDate: z.string().min(1),
  notes: z.string().max(1000).optional().or(z.literal('')),
});
