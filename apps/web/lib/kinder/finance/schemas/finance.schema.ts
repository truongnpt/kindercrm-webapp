import { z } from 'zod';

const BILLING_CYCLES = [
  'monthly',
  'quarterly',
  'semester',
  'yearly',
  'one_time',
] as const;

const PAYMENT_METHODS = ['cash', 'bank_transfer', 'card', 'other', 'qr_banking'] as const;

const ADJUSTMENT_TYPES = ['discount', 'scholarship'] as const;

const INVOICE_STATUSES = [
  'draft',
  'issued',
  'partial',
  'paid',
  'overdue',
  'cancelled',
  'waiting_verification',
] as const;

const FEE_CATEGORIES = [
  'tuition',
  'meals',
  'bus',
  'uniform',
  'extracurricular',
  'club',
  'insurance',
  'other',
] as const;

const PAYMENT_STATUSES = [
  'pending',
  'waiting_verification',
  'verified',
  'rejected',
] as const;

export const CreateTuitionFeeItemSchema = z.object({
  schoolId: z.string().uuid(),
  name: z.string().min(2).max(255),
  description: z.string().max(1000).optional().or(z.literal('')),
  amount: z.coerce.number().int().min(0),
  billingCycle: z.enum(BILLING_CYCLES).default('monthly'),
  category: z.enum(FEE_CATEGORIES).default('tuition'),
});

export const UpdateTuitionFeeItemSchema = z.object({
  feeItemId: z.string().uuid(),
  schoolId: z.string().uuid(),
  name: z.string().min(2).max(255),
  description: z.string().max(1000).optional().or(z.literal('')),
  amount: z.coerce.number().int().min(0),
  billingCycle: z.enum(BILLING_CYCLES),
  category: z.enum(FEE_CATEGORIES),
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

export const VerifyPaymentSchema = z.object({
  schoolId: z.string().uuid(),
  paymentId: z.string().uuid(),
  invoiceId: z.string().uuid(),
  approved: z.boolean(),
  verificationNote: z.string().max(500).optional().or(z.literal('')),
});

export const SubmitParentPaymentSchema = z.object({
  schoolId: z.string().uuid(),
  invoiceId: z.string().uuid(),
  studentId: z.string().uuid(),
  amount: z.coerce.number().int().positive(),
  paymentMethod: z.enum(['bank_transfer', 'qr_banking']).default('bank_transfer'),
  proofUrl: z.union([z.string().url(), z.literal('')]).optional(),
});

export function createSubmitParentPaymentSchema(
  maxAmount: number,
  messages?: { exceedsBalance?: string },
) {
  return SubmitParentPaymentSchema.extend({
    amount: z.coerce
      .number()
      .int()
      .positive()
      .max(maxAmount, {
        message:
          messages?.exceedsBalance ?? 'Amount exceeds available balance',
      }),
  });
}

export const CreateFeePlanSchema = z.object({
  schoolId: z.string().uuid(),
  name: z.string().min(2).max(255),
  classId: z.string().uuid().optional().or(z.literal('')),
  studentId: z.string().uuid().optional().or(z.literal('')),
  academicYear: z.string().max(9).optional().or(z.literal('')),
  effectiveFrom: z.string().min(1),
  effectiveTo: z.string().optional().or(z.literal('')),
  feeItemIds: z.array(z.string().uuid()).min(1),
});

export const BatchCreateInvoicesSchema = z.object({
  schoolId: z.string().uuid(),
  title: z.string().min(2).max(255),
  billingPeriod: z.string().regex(/^\d{4}-\d{2}$/),
  dueDate: z.string().min(1),
  notes: z.string().max(2000).optional().or(z.literal('')),
  feeItemIds: z.array(z.string().uuid()).min(1),
  classId: z.string().uuid().optional().or(z.literal('')),
});

export const InvoiceStatusFilterSchema = z.enum([...INVOICE_STATUSES, 'all']);
export const FeeCategorySchema = z.enum(FEE_CATEGORIES);
export const PaymentStatusSchema = z.enum(PAYMENT_STATUSES);
