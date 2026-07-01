import { z } from 'zod';

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const CreateSchoolSchema = z.object({
  name: z.string().min(2).max(255),
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(slugRegex, 'Slug chỉ được chứa chữ thường, số và dấu gạch ngang'),
  phone: z.string().max(50).optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().max(500).optional().or(z.literal('')),
  campusName: z.string().min(2).max(255).default('Cơ sở chính'),
});

export const UpdateSchoolSchema = z.object({
  schoolId: z.string().uuid(),
  name: z.string().min(2).max(255),
  phone: z.string().max(50).optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().max(500).optional().or(z.literal('')),
  logoUrl: z.string().url().optional().or(z.literal('')),
  themePrimaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional()
    .or(z.literal('')),
  customDomain: z.string().max(255).optional().or(z.literal('')),
});

export const SwitchSchoolSchema = z.object({
  schoolId: z.string().uuid(),
});

export type CreateSchoolInput = z.infer<typeof CreateSchoolSchema>;
export type UpdateSchoolInput = z.infer<typeof UpdateSchoolSchema>;
