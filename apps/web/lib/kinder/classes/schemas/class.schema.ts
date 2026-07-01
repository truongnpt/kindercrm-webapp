import { z } from 'zod';

export const CreateSchoolYearSchema = z.object({
  schoolId: z.string().uuid(),
  name: z.string().min(2).max(100),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  isCurrent: z.boolean().default(true),
});

export const CreateSemesterSchema = z.object({
  schoolId: z.string().uuid(),
  schoolYearId: z.string().uuid(),
  name: z.string().min(2).max(100),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  sortOrder: z.number().int().min(0).default(0),
});

export const CreateClassroomSchema = z.object({
  schoolId: z.string().uuid(),
  campusId: z.string().uuid().optional().or(z.literal('')),
  name: z.string().min(2).max(255),
  capacity: z.coerce.number().int().min(1).max(500).default(30),
});

export const CreateClassSchema = z.object({
  schoolId: z.string().uuid(),
  schoolYearId: z.string().uuid(),
  semesterId: z.string().uuid().optional().or(z.literal('')),
  campusId: z.string().uuid().optional().or(z.literal('')),
  classroomId: z.string().uuid().optional().or(z.literal('')),
  name: z.string().min(2).max(255),
  code: z.string().min(2).max(50),
  capacity: z.coerce.number().int().min(1).max(200).default(25),
  teacherUserId: z.string().uuid().optional().or(z.literal('')),
});

export const UpdateClassSchema = z.object({
  classId: z.string().uuid(),
  schoolId: z.string().uuid(),
  name: z.string().min(2).max(255),
  code: z.string().min(2).max(50),
  capacity: z.coerce.number().int().min(1).max(200),
  semesterId: z.string().uuid().optional().or(z.literal('')),
  classroomId: z.string().uuid().optional().or(z.literal('')),
  teacherUserId: z.string().uuid().optional().or(z.literal('')),
});

export const ArchiveClassSchema = z.object({
  classId: z.string().uuid(),
  schoolId: z.string().uuid(),
});

export const AssignTeacherSchema = z.object({
  classId: z.string().uuid(),
  schoolId: z.string().uuid(),
  teacherUserId: z.string().uuid().optional().or(z.literal('')),
});

export const EnrollStudentSchema = z.object({
  classId: z.string().uuid(),
  schoolId: z.string().uuid(),
  studentId: z.string().uuid(),
});

export const TransferStudentSchema = z.object({
  schoolId: z.string().uuid(),
  studentId: z.string().uuid(),
  fromClassId: z.string().uuid(),
  toClassId: z.string().uuid(),
});

export const CreateScheduleSchema = z.object({
  classId: z.string().uuid(),
  schoolId: z.string().uuid(),
  dayOfWeek: z.coerce.number().int().min(0).max(6),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  label: z.string().min(1).max(255).default('Hoạt động'),
});
