import { z } from 'zod';

export const UpsertInventoryCategorySchema = z.object({
  id: z.string().uuid().optional(),
  schoolId: z.string().uuid(),
  name: z.string().min(1).max(150),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export const UpsertSupplierSchema = z.object({
  id: z.string().uuid().optional(),
  schoolId: z.string().uuid(),
  name: z.string().min(1).max(200),
  contactName: z.string().max(150).optional().or(z.literal('')),
  phone: z.string().max(50).optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().max(500).optional().or(z.literal('')),
  notes: z.string().max(1000).optional().or(z.literal('')),
});

export const UpsertProductSchema = z.object({
  id: z.string().uuid().optional(),
  schoolId: z.string().uuid(),
  categoryId: z.string().uuid().optional(),
  supplierId: z.string().uuid().optional(),
  sku: z.string().max(80).optional().or(z.literal('')),
  name: z.string().min(1).max(200),
  unit: z.string().max(50).default('cái'),
  minQuantity: z.coerce.number().min(0).default(0),
  trackExpiry: z.boolean().default(false),
  notes: z.string().max(1000).optional().or(z.literal('')),
});

export const RecordInventoryTransactionSchema = z.object({
  schoolId: z.string().uuid(),
  productId: z.string().uuid(),
  transactionType: z.enum(['receipt', 'issue', 'adjustment', 'transfer']),
  quantity: z.coerce.number().positive(),
  unitCost: z.coerce.number().min(0).optional(),
  transactionDate: z.string().min(1),
  expiryDate: z.string().optional().or(z.literal('')),
  referenceNumber: z.string().max(100).optional().or(z.literal('')),
  supplierId: z.string().uuid().optional(),
  notes: z.string().max(1000).optional().or(z.literal('')),
});
