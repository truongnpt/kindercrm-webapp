import { z } from 'zod';

const PAYMENT_METHOD_TYPES = ['cash', 'bank_transfer', 'qr_banking'] as const;

export const UpdatePaymentMethodSchema = z.object({
  schoolId: z.string().uuid(),
  methodId: z.string().uuid(),
  isEnabled: z.boolean(),
  isDefault: z.boolean().optional(),
});

export const UpsertPaymentAccountSchema = z.object({
  schoolId: z.string().uuid(),
  accountId: z.string().uuid().optional(),
  campusId: z.string().uuid().optional().or(z.literal('')),
  bankName: z.string().min(2).max(255),
  bankCode: z.string().min(2).max(20),
  accountNumber: z.string().min(4).max(50),
  accountName: z.string().min(2).max(255),
  branch: z.string().max(255).optional().or(z.literal('')),
  logoUrl: z.string().url().optional().or(z.literal('')),
  isDefault: z.boolean().default(false),
  status: z.enum(['active', 'inactive']).default('active'),
});

export const SetDefaultPaymentAccountSchema = z.object({
  schoolId: z.string().uuid(),
  accountId: z.string().uuid(),
});

export const DeactivatePaymentAccountSchema = z.object({
  schoolId: z.string().uuid(),
  accountId: z.string().uuid(),
});

export const UpdatePaymentInstructionsSchema = z.object({
  schoolId: z.string().uuid(),
  title: z.string().min(2).max(255),
  description: z.string().max(5000).optional().or(z.literal('')),
  imageUrl: z.string().url().optional().or(z.literal('')),
  videoUrl: z.string().url().optional().or(z.literal('')),
  notes: z.string().max(2000).optional().or(z.literal('')),
});

export const PaymentMethodTypeSchema = z.enum(PAYMENT_METHOD_TYPES);
