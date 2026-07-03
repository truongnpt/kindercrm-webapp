import { z } from 'zod';

const LEAVE_TYPES = ['annual', 'sick', 'unpaid', 'other'] as const;
const LEAVE_STATUSES = ['pending', 'approved', 'rejected', 'cancelled'] as const;
const DOCUMENT_TYPES = [
  'id_card',
  'degree',
  'certificate',
  'contract',
  'other',
] as const;
const GENDERS = ['male', 'female', 'other'] as const;

export const StaffCheckInSchema = z.object({
  schoolId: z.string().uuid(),
  employeeId: z.string().uuid(),
  attendanceDate: z.string().min(1),
  checkInAt: z.string().optional(),
  notes: z.string().max(500).optional().or(z.literal('')),
});

export const StaffCheckOutSchema = z.object({
  schoolId: z.string().uuid(),
  attendanceId: z.string().uuid(),
  checkOutAt: z.string().optional(),
  isEarlyLeave: z.boolean().default(false),
});

export const StaffManualAttendanceSchema = z.object({
  schoolId: z.string().uuid(),
  employeeId: z.string().uuid(),
  attendanceDate: z.string().min(1),
  checkInAt: z.string().optional().or(z.literal('')),
  checkOutAt: z.string().optional().or(z.literal('')),
  isLate: z.boolean().default(false),
  isEarlyLeave: z.boolean().default(false),
  notes: z.string().max(500).optional().or(z.literal('')),
});

export const CreateStaffLeaveRequestSchema = z.object({
  schoolId: z.string().uuid(),
  employeeId: z.string().uuid(),
  leaveType: z.enum(LEAVE_TYPES).default('annual'),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  reason: z.string().max(1000).optional().or(z.literal('')),
});

export const ReviewStaffLeaveRequestSchema = z.object({
  schoolId: z.string().uuid(),
  requestId: z.string().uuid(),
  status: z.enum(['approved', 'rejected'] as const),
  reviewNote: z.string().max(1000).optional().or(z.literal('')),
});

export const CreateStaffDocumentSchema = z.object({
  schoolId: z.string().uuid(),
  employeeId: z.string().uuid(),
  documentType: z.enum(DOCUMENT_TYPES).default('other'),
  title: z.string().min(2).max(255),
  fileUrl: z.string().url(),
  fileName: z.string().max(255).optional().or(z.literal('')),
  expiresAt: z.string().optional().or(z.literal('')),
  notes: z.string().max(1000).optional().or(z.literal('')),
});

export const DeleteStaffDocumentSchema = z.object({
  schoolId: z.string().uuid(),
  documentId: z.string().uuid(),
});

export const RenewStaffContractSchema = z.object({
  schoolId: z.string().uuid(),
  contractId: z.string().uuid(),
  employeeId: z.string().uuid(),
  startDate: z.string().min(1),
  endDate: z.string().optional().or(z.literal('')),
  salaryAmount: z.coerce.number().int().min(0).optional(),
});

export const TerminateStaffContractSchema = z.object({
  schoolId: z.string().uuid(),
  contractId: z.string().uuid(),
  employeeId: z.string().uuid(),
});

export const ImportStaffEmployeeRowSchema = z.object({
  fullName: z.string().min(2).max(255),
  employeeCode: z.string().max(50).optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().max(50).optional().or(z.literal('')),
  departmentName: z.string().max(255).optional().or(z.literal('')),
  positionName: z.string().max(255).optional().or(z.literal('')),
  hireDate: z.string().optional().or(z.literal('')),
  gender: z.enum(GENDERS).optional(),
  dateOfBirth: z.string().optional().or(z.literal('')),
  idNumber: z.string().max(50).optional().or(z.literal('')),
  address: z.string().max(500).optional().or(z.literal('')),
  isTeacher: z.boolean().default(false),
});

export const ImportStaffEmployeesSchema = z.object({
  schoolId: z.string().uuid(),
  rows: z.array(ImportStaffEmployeeRowSchema).min(1).max(500),
});
