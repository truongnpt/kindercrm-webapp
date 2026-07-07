import { z } from 'zod';

export const SubscriptionCheckoutSchema = z.object({
  schoolId: z.string().uuid(),
  packageId: z.string().uuid(),
  couponCode: z.string().trim().min(2).max(64).optional().or(z.literal('')),
  billingInterval: z.enum(['monthly', 'yearly']).default('monthly'),
});

export const ValidateSubscriptionCouponSchema = z.object({
  schoolId: z.string().uuid(),
  packageId: z.string().uuid(),
  couponCode: z.string().trim().min(2).max(64),
});

export const BillingPortalSchema = z.object({
  schoolId: z.string().uuid(),
  intent: z.enum(['default', 'payment_method_update']).optional(),
});

export type SubscriptionCheckoutInput = z.infer<typeof SubscriptionCheckoutSchema>;
export type BillingPortalInput = z.infer<typeof BillingPortalSchema>;
export type BillingPortalIntent = NonNullable<BillingPortalInput['intent']>;
