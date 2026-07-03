import { z } from 'zod';

export const STUDENT_CONTRACT_TYPES = [
  'enrollment',
  're_enrollment',
  'service',
  'tuition_agreement',
] as const;

export const STUDENT_CONTRACT_STATUSES = [
  'draft',
  'active',
  'expired',
  'terminated',
  'cancelled',
] as const;

export const CreateStudentContractSchema = z.object({
  schoolId: z.string().uuid(),
  studentId: z.string().uuid(),
  contractType: z.enum(STUDENT_CONTRACT_TYPES),
  title: z.string().min(2).max(255),
  startDate: z.string().min(1),
  endDate: z.string().optional().or(z.literal('')),
  totalAmount: z.coerce.number().int().min(0).default(0),
  billingPeriod: z
    .string()
    .regex(/^\d{4}-\d{2}$/)
    .optional()
    .or(z.literal('')),
  terms: z.string().max(4000).optional().or(z.literal('')),
  signedAt: z.string().optional().or(z.literal('')),
  activate: z.boolean().default(false),
  createInvoice: z.boolean().default(false),
  feeItemIds: z.array(z.string().uuid()).optional(),
});

export const UpdateStudentContractSchema = z.object({
  schoolId: z.string().uuid(),
  contractId: z.string().uuid(),
  title: z.string().min(2).max(255),
  startDate: z.string().min(1),
  endDate: z.string().optional().or(z.literal('')),
  totalAmount: z.coerce.number().int().min(0),
  billingPeriod: z
    .string()
    .regex(/^\d{4}-\d{2}$/)
    .optional()
    .or(z.literal('')),
  terms: z.string().max(4000).optional().or(z.literal('')),
  signedAt: z.string().optional().or(z.literal('')),
});

export const UpdateStudentContractStatusSchema = z.object({
  schoolId: z.string().uuid(),
  contractId: z.string().uuid(),
  status: z.enum(STUDENT_CONTRACT_STATUSES),
});

export const LinkStudentContractInvoiceSchema = z.object({
  schoolId: z.string().uuid(),
  contractId: z.string().uuid(),
  invoiceId: z.string().uuid(),
});
