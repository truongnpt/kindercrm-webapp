import { z } from 'zod';

import { LEAD_STAGES } from '../pipeline-stages';

export const CreateLeadSchema = z.object({
  schoolId: z.string().uuid(),
  campusId: z.string().uuid().optional().or(z.literal('')),
  sourceId: z.string().uuid().optional().or(z.literal('')),
  parentName: z.string().min(2).max(255),
  phone: z.string().min(8).max(50),
  email: z.string().email().optional().or(z.literal('')),
  childName: z.string().max(255).optional().or(z.literal('')),
  childDob: z.string().optional().or(z.literal('')),
  notes: z.string().max(2000).optional().or(z.literal('')),
  stage: z.enum(LEAD_STAGES).default('new'),
});

export const UpdateLeadSchema = z.object({
  leadId: z.string().uuid(),
  schoolId: z.string().uuid(),
  campusId: z.string().uuid().optional().or(z.literal('')),
  sourceId: z.string().uuid().optional().or(z.literal('')),
  parentName: z.string().min(2).max(255),
  phone: z.string().min(8).max(50),
  email: z.string().email().optional().or(z.literal('')),
  childName: z.string().max(255).optional().or(z.literal('')),
  childDob: z.string().optional().or(z.literal('')),
  notes: z.string().max(2000).optional().or(z.literal('')),
  stage: z.enum(LEAD_STAGES).optional(),
  status: z.enum(['active', 'won', 'lost']).optional(),
});

export const UpdateLeadStageSchema = z.object({
  leadId: z.string().uuid(),
  schoolId: z.string().uuid(),
  stage: z.enum(LEAD_STAGES),
});

export const AssignLeadSchema = z.object({
  leadId: z.string().uuid(),
  schoolId: z.string().uuid(),
  assignedTo: z.string().uuid().optional().or(z.literal('')),
});

export const DeleteLeadSchema = z.object({
  leadId: z.string().uuid(),
  schoolId: z.string().uuid(),
});

export const CreateLeadNoteSchema = z.object({
  leadId: z.string().uuid(),
  schoolId: z.string().uuid(),
  body: z.string().min(1).max(5000),
});

export type CreateLeadInput = z.infer<typeof CreateLeadSchema>;
export type UpdateLeadInput = z.infer<typeof UpdateLeadSchema>;
