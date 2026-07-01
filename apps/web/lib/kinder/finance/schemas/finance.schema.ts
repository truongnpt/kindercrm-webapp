import { z } from 'zod';

const BILLING_CYCLES = [
  'monthly',
  'quarterly',
  'semester',
  'yearly',
  'one_time',
] as const;

const PAYMENT_METHODS = ['cash', 'bank_transfer', 'card', 'other'] as const;

const ADJUSTMENT_TYPES = ['discount', 'scholarship'] as const;

const INVOICE_STATUSES = [
  'draft',
  'issued',
  'partial',
  'paid',
  'overdue',
  'cancelled',
] as const;

export const CreateTuitionFeeItemSchema = z.object({
  schoolId: z.string().uuid(),
  name: z.string().min(2).max(255),
  description: z.string().max(1000).optional().or(z.literal('')),
  amount: z.coerce.number().int().min(0),
  billingCycle: z.enum(BILLING_CYCLES).default('monthly'),
});

export const UpdateTuitionFeeItemSchema = z.object({
  feeItemId: z.string().uuid(),
  schoolId: z.string().uuid(),
  name: z.string().min(2).max(255),
  description: z.string().max(1000).optional().or(z.literal('')),
  amount: z.coerce.number().int().min(0),
  billingCycle: z.enum(BILLING_CYCLES),
  isActive: z.boolean(),
});

export const CreateInvoiceSchema = z.object({
  schoolId: z.string().uuid(),
  studentId: z.string().uuid(),
  title: z.string().min(2).max(255),
  billingPeriod: z.string().regex(/^\d{4}-\d{2}$/),
  dueDate: z.string().min(1),
  notes: z.string().max(2000).optional().or(z.literal('')),
  feeItemIds: z.array(z.string().uuid()).min(1),
});

export const AddInvoiceAdjustmentSchema = z.object({
  schoolId: z.string().uuid(),
  invoiceId: z.string().uuid(),
  adjustmentType: z.enum(ADJUSTMENT_TYPES).default('discount'),
  label: z.string().min(2).max(255),
  amount: z.coerce.number().int().min(0),
});

export const RecordPaymentSchema = z.object({
  schoolId: z.string().uuid(),
  invoiceId: z.string().uuid(),
  amount: z.coerce.number().int().positive(),
  paymentMethod: z.enum(PAYMENT_METHODS).default('cash'),
  paidAt: z.string().optional().or(z.literal('')),
  referenceNote: z.string().max(500).optional().or(z.literal('')),
});

export const RecordRefundSchema = z.object({
  schoolId: z.string().uuid(),
  paymentId: z.string().uuid(),
  invoiceId: z.string().uuid(),
  amount: z.coerce.number().int().positive(),
  reason: z.string().max(500).optional().or(z.literal('')),
});

export const CancelInvoiceSchema = z.object({
  schoolId: z.string().uuid(),
  invoiceId: z.string().uuid(),
});

export const InvoiceStatusFilterSchema = z.enum([...INVOICE_STATUSES, 'all']);
