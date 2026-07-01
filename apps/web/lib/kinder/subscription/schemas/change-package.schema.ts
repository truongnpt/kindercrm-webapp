import { z } from 'zod';

export const ChangePackageSchema = z.object({
  schoolId: z.string().uuid(),
  packageId: z.string().uuid(),
  note: z.string().max(500).optional().or(z.literal('')),
});

export type ChangePackageInput = z.infer<typeof ChangePackageSchema>;
