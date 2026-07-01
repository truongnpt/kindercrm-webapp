import { z } from 'zod';

export const CreatePurchaseOrderSchema = z.object({
  schoolId: z.string().uuid(),
  supplierId: z.string().uuid().optional(),
  poNumber: z.string().min(1).max(80),
  orderDate: z.string().min(1),
  expectedDate: z.string().optional().or(z.literal('')),
  notes: z.string().max(2000).optional().or(z.literal('')),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.coerce.number().positive(),
        unitCost: z.coerce.number().min(0).default(0),
      }),
    )
    .min(1),
});

export const ReceivePurchaseOrderSchema = z.object({
  schoolId: z.string().uuid(),
  purchaseOrderId: z.string().uuid(),
});

export const CancelPurchaseOrderSchema = z.object({
  schoolId: z.string().uuid(),
  purchaseOrderId: z.string().uuid(),
});
