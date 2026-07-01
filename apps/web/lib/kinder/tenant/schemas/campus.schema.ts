import { z } from 'zod';

export const CreateCampusSchema = z.object({
  schoolId: z.string().uuid(),
  name: z.string().min(2).max(255),
  campusType: z.enum(['campus', 'branch']).default('campus'),
  parentCampusId: z.string().uuid().optional().or(z.literal('')),
  address: z.string().max(500).optional().or(z.literal('')),
  phone: z.string().max(50).optional().or(z.literal('')),
  isMain: z.boolean().default(false),
});

export const UpdateCampusSchema = CreateCampusSchema.partial().extend({
  campusId: z.string().uuid(),
  schoolId: z.string().uuid(),
});

export type CreateCampusInput = z.infer<typeof CreateCampusSchema>;
