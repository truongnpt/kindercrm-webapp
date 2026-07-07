import { z } from 'zod';

export const CreateSubscriptionCouponSchema = z
  .object({
    code: z.string().trim().min(3).max(32),
    description: z.string().trim().max(200).optional().or(z.literal('')),
    discountType: z.enum(['percent_off', 'free_months']),
    discountValue: z.number().positive(),
    maxRedemptions: z.number().int().positive().optional().nullable(),
    expiresAt: z.string().optional().or(z.literal('')),
    applicablePackageCodes: z.array(z.string()).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.discountType === 'percent_off') {
      if (data.discountValue > 100) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Percent discount cannot exceed 100',
          path: ['discountValue'],
        });
      }
      return;
    }

    if (!Number.isInteger(data.discountValue)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Free months must be a whole number',
        path: ['discountValue'],
      });
    }

    if (data.discountValue < 1 || data.discountValue > 24) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Free months must be between 1 and 24',
        path: ['discountValue'],
      });
    }
  });

export type CreateSubscriptionCouponInput = z.infer<
  typeof CreateSubscriptionCouponSchema
>;
