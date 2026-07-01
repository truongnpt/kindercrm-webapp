import { z } from 'zod';

const STUDENT_GENDERS = ['male', 'female', 'other'] as const;

export const ImportStudentRowSchema = z.object({
  fullName: z.string().min(2).max(255),
  studentCode: z.string().max(50).optional().or(z.literal('')),
  dateOfBirth: z.string().optional().or(z.literal('')),
  gender: z.enum(STUDENT_GENDERS).optional(),
  className: z.string().max(255).optional().or(z.literal('')),
  enrollmentDate: z.string().optional().or(z.literal('')),
  parentName: z.string().max(255).optional().or(z.literal('')),
  parentPhone: z.string().max(50).optional().or(z.literal('')),
  parentEmail: z.string().email().optional().or(z.literal('')),
  notes: z.string().max(2000).optional().or(z.literal('')),
});

export const ImportStudentsSchema = z.object({
  schoolId: z.string().uuid(),
  students: z.array(ImportStudentRowSchema).min(1).max(500),
});
