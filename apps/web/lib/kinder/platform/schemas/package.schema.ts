import { z } from 'zod';

const featuresSchema = z.record(z.string(), z.boolean());

export const CreatePackageSchema = z.object({
  code: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9_-]+$/, 'Lowercase letters, numbers, hyphens only'),
  name: z.string().min(1).max(255),
  description: z.string().max(2000).optional().or(z.literal('')),
  maxStudents: z.coerce.number().int().min(1),
  maxCampuses: z.coerce.number().int().min(1),
  maxStorageMb: z.coerce.number().int().min(0),
  aiCreditsMonthly: z.coerce.number().int().min(0),
  priceMonthly: z.coerce.number().int().min(0),
  priceYearly: z.coerce.number().int().min(0).default(0),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  stripePriceId: z
    .string()
    .max(255)
    .default('')
    .refine((value) => !value || value.startsWith('price_'), {
      message: 'Must start with price_',
    }),
  stripePriceYearlyId: z
    .string()
    .max(255)
    .default('')
    .refine((value) => !value || value.startsWith('price_'), {
      message: 'Must start with price_',
    }),
  featuresAll: z.boolean().default(false),
  features: featuresSchema.default({}),
});

export const UpdatePackageSchema = CreatePackageSchema.omit({ code: true }).extend({
  packageId: z.string().uuid(),
});

export const PlatformOverrideSubscriptionSchema = z.object({
  schoolId: z.string().uuid(),
  packageId: z.string().uuid(),
  status: z.enum(['trial', 'active', 'past_due', 'cancelled']),
  trialEndsAt: z.string().optional().or(z.literal('')),
  note: z.string().max(500).optional().or(z.literal('')),
});

export const RepairSchoolSubscriptionSchema = z.object({
  schoolId: z.string().uuid(),
});

export const GrantPlatformAdminSchema = z.object({
  email: z.string().email(),
  role: z.enum(['super_admin', 'support', 'billing']),
  notes: z.string().max(500).optional().or(z.literal('')),
});

export const RevokePlatformAdminSchema = z.object({
  platformAdminId: z.string().uuid(),
});
