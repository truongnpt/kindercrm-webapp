import { z } from 'zod';

const studentId = z.string().uuid();
const schoolId = z.string().uuid();

export const UpsertGrowthRecordSchema = z.object({
  id: z.string().uuid().optional(),
  schoolId,
  studentId,
  recordDate: z.string().min(1),
  heightCm: z.coerce.number().positive().optional(),
  weightKg: z.coerce.number().positive().optional(),
  notes: z.string().max(1000).optional().or(z.literal('')),
});

export const UpsertVaccinationSchema = z.object({
  id: z.string().uuid().optional(),
  schoolId,
  studentId,
  vaccineName: z.string().min(1).max(200),
  doseNumber: z.coerce.number().int().min(1).default(1),
  administeredOn: z.string().min(1),
  nextDueOn: z.string().optional().or(z.literal('')),
  provider: z.string().max(200).optional().or(z.literal('')),
  notes: z.string().max(1000).optional().or(z.literal('')),
});

export const UpsertMedicalCheckupSchema = z.object({
  id: z.string().uuid().optional(),
  schoolId,
  studentId,
  checkupDate: z.string().min(1),
  checkupType: z.string().max(100).default('periodic'),
  heightCm: z.coerce.number().positive().optional(),
  weightKg: z.coerce.number().positive().optional(),
  visionResult: z.string().max(100).optional().or(z.literal('')),
  hearingResult: z.string().max(100).optional().or(z.literal('')),
  dentalResult: z.string().max(100).optional().or(z.literal('')),
  doctorName: z.string().max(200).optional().or(z.literal('')),
  notes: z.string().max(2000).optional().or(z.literal('')),
});

export const UpsertHealthMedicationSchema = z.object({
  id: z.string().uuid().optional(),
  schoolId,
  studentId,
  name: z.string().min(1).max(200),
  dosage: z.string().max(100).optional().or(z.literal('')),
  frequency: z.string().max(100).optional().or(z.literal('')),
  startDate: z.string().min(1),
  endDate: z.string().optional().or(z.literal('')),
  instructions: z.string().max(2000).optional().or(z.literal('')),
  isActive: z.boolean().default(true),
});

export const CreateHealthIncidentSchema = z.object({
  schoolId,
  studentId,
  incidentDate: z.string().min(1),
  incidentTime: z.string().optional().or(z.literal('')),
  incidentType: z.enum([
    'injury',
    'illness',
    'allergy_reaction',
    'fall',
    'other',
  ]),
  severity: z.enum(['minor', 'moderate', 'serious']),
  description: z.string().min(1).max(5000),
  treatment: z.string().max(2000).optional().or(z.literal('')),
  notifyParent: z.boolean().default(false),
});

export const NotifyParentIncidentSchema = z.object({
  schoolId,
  incidentId: z.string().uuid(),
});
