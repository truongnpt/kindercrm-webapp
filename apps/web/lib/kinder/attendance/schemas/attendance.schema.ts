import { z } from 'zod';

const ATTENDANCE_STATUSES = [
  'present',
  'absent',
  'late',
  'excused',
  'early_leave',
] as const;

export const RecordAttendanceItemSchema = z.object({
  studentId: z.string().uuid(),
  status: z.enum(ATTENDANCE_STATUSES),
  checkInAt: z.string().optional().or(z.literal('')),
  checkOutAt: z.string().optional().or(z.literal('')),
  lateMinutes: z.coerce.number().int().min(0).optional(),
  notes: z.string().max(500).optional().or(z.literal('')),
});

export const RecordClassAttendanceSchema = z.object({
  schoolId: z.string().uuid(),
  classId: z.string().uuid(),
  attendanceDate: z.string().min(1),
  records: z.array(RecordAttendanceItemSchema).min(1),
});

export const CheckInSchema = z.object({
  schoolId: z.string().uuid(),
  studentId: z.string().uuid(),
  classId: z.string().uuid(),
  attendanceDate: z.string().min(1),
  isLate: z.boolean().optional(),
  lateMinutes: z.coerce.number().int().min(0).optional(),
});

export const CheckOutSchema = z.object({
  schoolId: z.string().uuid(),
  studentId: z.string().uuid(),
  classId: z.string().uuid(),
  attendanceDate: z.string().min(1),
});

export const CreateLeaveRequestSchema = z.object({
  schoolId: z.string().uuid(),
  studentId: z.string().uuid(),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  reason: z.string().max(1000).optional().or(z.literal('')),
});

export const ReviewLeaveRequestSchema = z.object({
  schoolId: z.string().uuid(),
  leaveRequestId: z.string().uuid(),
  status: z.enum(['approved', 'rejected']),
});
