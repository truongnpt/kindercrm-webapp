import { z } from 'zod';

export const PlatformSchoolActionSchema = z.object({
  schoolId: z.string().uuid(),
});
