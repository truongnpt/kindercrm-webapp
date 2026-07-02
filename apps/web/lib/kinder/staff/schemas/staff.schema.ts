import { z } from 'zod';

const EMPLOYMENT_STATUSES = [
  'active',
  'inactive',
  'on_leave',
  'terminated',
] as const;

const ACCESS_ROLES = ['staff', 'admin', 'accountant'] as const;

const CONTRACT_TYPES = [
  'full_time',
  'part_time',
  'contract',
  'probation',
] as const;

const GENDERS = ['male', 'female', 'other'] as const;

export const CreateDepartmentSchema = z.object({
  schoolId: z.string().uuid(),
  name: z.string().min(2).max(255),
  description: z.string().max(1000).optional().or(z.literal('')),
});

export const CreatePositionSchema = z.object({
  schoolId: z.string().uuid(),
  name: z.string().min(2).max(255),
  departmentId: z.string().uuid().optional().or(z.literal('')),
  description: z.string().max(1000).optional().or(z.literal('')),
});

export const CreateStaffEmployeeSchema = z.object({
  schoolId: z.string().uuid(),
  fullName: z.string().min(2).max(255),
  employeeCode: z.string().min(2).max(50).optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().max(50).optional().or(z.literal('')),
  isTeacher: z.boolean().default(false),
  accessRole: z.enum(ACCESS_ROLES).default('staff'),
  grantSystemAccess: z.boolean().default(false),
  departmentId: z.string().uuid().optional().or(z.literal('')),
  positionId: z.string().uuid().optional().or(z.literal('')),
  campusId: z.string().uuid().optional().or(z.literal('')),
  hireDate: z.string().optional().or(z.literal('')),
  dateOfBirth: z.string().optional().or(z.literal('')),
  gender: z.enum(GENDERS).optional(),
  idNumber: z.string().max(50).optional().or(z.literal('')),
  address: z.string().max(500).optional().or(z.literal('')),
  emergencyContactName: z.string().max(255).optional().or(z.literal('')),
  emergencyContactPhone: z.string().max(50).optional().or(z.literal('')),
  notes: z.string().max(2000).optional().or(z.literal('')),
});

export const UpdateStaffEmployeeSchema = z.object({
  employeeId: z.string().uuid(),
  schoolId: z.string().uuid(),
  fullName: z.string().min(2).max(255),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().max(50).optional().or(z.literal('')),
  isTeacher: z.boolean(),
  accessRole: z.enum(ACCESS_ROLES),
  grantSystemAccess: z.boolean(),
  departmentId: z.string().uuid().optional().or(z.literal('')),
  positionId: z.string().uuid().optional().or(z.literal('')),
  campusId: z.string().uuid().optional().or(z.literal('')),
  employmentStatus: z.enum(EMPLOYMENT_STATUSES),
  hireDate: z.string().optional().or(z.literal('')),
  terminationDate: z.string().optional().or(z.literal('')),
  dateOfBirth: z.string().optional().or(z.literal('')),
  gender: z.enum(GENDERS).optional(),
  idNumber: z.string().max(50).optional().or(z.literal('')),
  address: z.string().max(500).optional().or(z.literal('')),
  emergencyContactName: z.string().max(255).optional().or(z.literal('')),
  emergencyContactPhone: z.string().max(50).optional().or(z.literal('')),
  notes: z.string().max(2000).optional().or(z.literal('')),
});

export const DeleteStaffEmployeeSchema = z.object({
  employeeId: z.string().uuid(),
  schoolId: z.string().uuid(),
});

export const CreateStaffContractSchema = z.object({
  schoolId: z.string().uuid(),
  employeeId: z.string().uuid(),
  contractType: z.enum(CONTRACT_TYPES).default('full_time'),
  title: z.string().min(2).max(255),
  startDate: z.string().min(1),
  endDate: z.string().optional().or(z.literal('')),
  salaryAmount: z.coerce.number().int().min(0),
  notes: z.string().max(2000).optional().or(z.literal('')),
});

export const AssignStaffClassSchema = z.object({
  schoolId: z.string().uuid(),
  employeeId: z.string().uuid(),
  classId: z.string().uuid(),
  assignmentRole: z.enum(['homeroom', 'assistant']).default('assistant'),
});

export const RemoveStaffClassAssignmentSchema = z.object({
  schoolId: z.string().uuid(),
  assignmentId: z.string().uuid(),
});
