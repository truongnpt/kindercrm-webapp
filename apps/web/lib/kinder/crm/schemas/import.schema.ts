import { z } from 'zod';

import { LEAD_STAGES } from '../pipeline-stages';

export const ImportLeadRowSchema = z.object({
  parentName: z.string().min(2).max(255),
  phone: z.string().min(8).max(50),
  email: z.string().email().optional().or(z.literal('')),
  childName: z.string().max(255).optional().or(z.literal('')),
  childDob: z.string().optional().or(z.literal('')),
  notes: z.string().max(2000).optional().or(z.literal('')),
  stage: z.enum(LEAD_STAGES).optional(),
});

export const ImportLeadsSchema = z.object({
  schoolId: z.string().uuid(),
  leads: z.array(ImportLeadRowSchema).min(1).max(500),
});
