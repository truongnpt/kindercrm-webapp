import { z } from 'zod';

export const LinkParentAccountSchema = z.object({
  schoolId: z.string().uuid(),
  studentId: z.string().uuid(),
  studentParentId: z.string().uuid().optional(),
  email: z.string().email(),
  relationship: z.string().max(50).default('guardian'),
  isPrimary: z.boolean().default(false),
});

export const UnlinkParentAccountSchema = z.object({
  schoolId: z.string().uuid(),
  linkId: z.string().uuid(),
  studentId: z.string().uuid(),
});

export { UpsertDailyReportSchema } from '~/lib/kinder/daily-reports/schemas/daily-report.schema';
