import { z } from 'zod';

export const SubmitEnterpriseInquirySchema = z.object({
  schoolId: z.string().uuid(),
  contactName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(8).max(20),
  campusCount: z.coerce.number().int().min(1).max(9999),
  notes: z.string().trim().max(2000).optional(),
});

export type SubmitEnterpriseInquiryInput = z.infer<
  typeof SubmitEnterpriseInquirySchema
>;
