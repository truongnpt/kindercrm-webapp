import { z } from 'zod';

const STUDENT_STATUSES = [
  'active',
  'inactive',
  'graduated',
  'transferred',
  'withdrawn',
] as const;

const STUDENT_GENDERS = ['male', 'female', 'other'] as const;

export const CreateStudentSchema = z.object({
  schoolId: z.string().uuid(),
  campusId: z.string().uuid().optional().or(z.literal('')),
  fullName: z.string().min(2).max(255),
  studentCode: z.string().min(2).max(50).optional().or(z.literal('')),
  dateOfBirth: z.string().optional().or(z.literal('')),
  gender: z.enum(STUDENT_GENDERS).optional(),
  className: z.string().max(255).optional().or(z.literal('')),
  enrollmentDate: z.string().optional().or(z.literal('')),
  notes: z.string().max(2000).optional().or(z.literal('')),
  parentName: z.string().min(2).max(255).optional().or(z.literal('')),
  parentPhone: z.string().max(50).optional().or(z.literal('')),
  parentEmail: z.string().email().optional().or(z.literal('')),
});

export const UpdateStudentSchema = z.object({
  studentId: z.string().uuid(),
  schoolId: z.string().uuid(),
  campusId: z.string().uuid().optional().or(z.literal('')),
  fullName: z.string().min(2).max(255),
  dateOfBirth: z.string().optional().or(z.literal('')),
  gender: z.enum(STUDENT_GENDERS).optional(),
  className: z.string().max(255).optional().or(z.literal('')),
  enrollmentDate: z.string().optional().or(z.literal('')),
  status: z.enum(STUDENT_STATUSES),
  notes: z.string().max(2000).optional().or(z.literal('')),
  photoUrl: z.string().url().optional().or(z.literal('')),
});

export const UpdateStudentStatusSchema = z.object({
  studentId: z.string().uuid(),
  schoolId: z.string().uuid(),
  status: z.enum(STUDENT_STATUSES),
  className: z.string().max(255).optional().or(z.literal('')),
});

export const DeleteStudentSchema = z.object({
  studentId: z.string().uuid(),
  schoolId: z.string().uuid(),
});

export const ConvertLeadSchema = z.object({
  leadId: z.string().uuid(),
  schoolId: z.string().uuid(),
});

export const CreateParentSchema = z.object({
  studentId: z.string().uuid(),
  schoolId: z.string().uuid(),
  fullName: z.string().min(2).max(255),
  phone: z.string().max(50).optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')),
  relationship: z.string().max(50).default('guardian'),
  isPrimary: z.boolean().default(false),
  address: z.string().max(500).optional().or(z.literal('')),
});

export const CreateEmergencyContactSchema = z.object({
  studentId: z.string().uuid(),
  schoolId: z.string().uuid(),
  fullName: z.string().min(2).max(255),
  phone: z.string().min(8).max(50),
  relationship: z.string().max(50).optional().or(z.literal('')),
});

export const UpsertMedicalRecordSchema = z.object({
  studentId: z.string().uuid(),
  schoolId: z.string().uuid(),
  bloodType: z.string().max(10).optional().or(z.literal('')),
  conditions: z.string().max(2000).optional().or(z.literal('')),
  medications: z.string().max(2000).optional().or(z.literal('')),
  doctorName: z.string().max(255).optional().or(z.literal('')),
  doctorPhone: z.string().max(50).optional().or(z.literal('')),
  notes: z.string().max(2000).optional().or(z.literal('')),
});

export const CreateAllergySchema = z.object({
  studentId: z.string().uuid(),
  schoolId: z.string().uuid(),
  allergen: z.string().min(1).max(255),
  severity: z.string().max(50).optional().or(z.literal('')),
  notes: z.string().max(500).optional().or(z.literal('')),
});

export const CreatePickupPersonSchema = z.object({
  studentId: z.string().uuid(),
  schoolId: z.string().uuid(),
  fullName: z.string().min(2).max(255),
  phone: z.string().max(50).optional().or(z.literal('')),
  idNumber: z.string().max(50).optional().or(z.literal('')),
  relationship: z.string().max(50).optional().or(z.literal('')),
});

export type CreateStudentInput = z.infer<typeof CreateStudentSchema>;
