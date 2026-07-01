import { z } from 'zod';

const MealRecordSchema = z.object({
  slot: z.enum(['breakfast', 'lunch', 'snack']),
  consumed: z.enum(['full', 'half', 'none', 'refused']),
  notes: z.string().max(500).optional().or(z.literal('')),
});

const SleepRecordSchema = z.object({
  from: z.string().max(20).optional().or(z.literal('')),
  to: z.string().max(20).optional().or(z.literal('')),
  quality: z.string().max(50).optional().or(z.literal('')),
  notes: z.string().max(1000).optional().or(z.literal('')),
});

const ToiletRecordSchema = z.object({
  type: z.enum(['wet', 'dry', 'bm']),
  time: z.string().max(20).optional().or(z.literal('')),
  notes: z.string().max(500).optional().or(z.literal('')),
});

const HealthObservationSchema = z.object({
  temperature: z.coerce.number().min(35).max(42).optional(),
  symptoms: z.string().max(500).optional().or(z.literal('')),
  notes: z.string().max(1000).optional().or(z.literal('')),
});

const MedicationRecordSchema = z.object({
  name: z.string().min(1).max(200),
  dosage: z.string().max(100).optional().or(z.literal('')),
  time: z.string().max(20).optional().or(z.literal('')),
  notes: z.string().max(500).optional().or(z.literal('')),
});

const LearningActivitySchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional().or(z.literal('')),
});

export const UpsertDailyReportSchema = z.object({
  schoolId: z.string().uuid(),
  studentId: z.string().uuid(),
  reportDate: z.string().min(1),
  mood: z.string().max(50).optional().or(z.literal('')),
  meals: z.string().max(2000).optional().or(z.literal('')),
  nap: z.string().max(2000).optional().or(z.literal('')),
  activities: z.string().max(2000).optional().or(z.literal('')),
  teacherNote: z.string().max(2000).optional().or(z.literal('')),
  dailySummary: z.string().max(2000).optional().or(z.literal('')),
  mealRecords: z.array(MealRecordSchema),
  sleepRecord: SleepRecordSchema.optional(),
  toiletRecords: z.array(ToiletRecordSchema),
  healthObservation: HealthObservationSchema.optional(),
  medicationRecords: z.array(MedicationRecordSchema),
  learningActivities: z.array(LearningActivitySchema),
});

export type UpsertDailyReportFormValues = z.infer<typeof UpsertDailyReportSchema>;

export const PublishDailyReportSchema = z.object({
  schoolId: z.string().uuid(),
  studentId: z.string().uuid(),
  reportDate: z.string().min(1),
});

export const AcknowledgeDailyReportSchema = z.object({
  reportId: z.string().uuid(),
});

export const AddTimelineEntrySchema = z.object({
  schoolId: z.string().uuid(),
  reportId: z.string().uuid(),
  entryType: z.string().max(50),
  title: z.string().min(1).max(200),
  content: z.string().max(2000).optional().or(z.literal('')),
  recordedAt: z.string().optional(),
});

export const BulkUpsertClassDailyReportsSchema = z.object({
  schoolId: z.string().uuid(),
  classId: z.string().uuid(),
  reportDate: z.string().min(1),
  reports: z.array(
    z.object({
      studentId: z.string().uuid(),
      mood: z.string().max(50).optional().or(z.literal('')),
      teacherNote: z.string().max(2000).optional().or(z.literal('')),
      dailySummary: z.string().max(2000).optional().or(z.literal('')),
    }),
  ),
});

export const RegisterAttachmentSchema = z.object({
  schoolId: z.string().uuid(),
  reportId: z.string().uuid(),
  storagePath: z.string().min(1).max(500),
  fileName: z.string().min(1).max(255),
  mediaType: z.enum(['photo', 'video']),
  mimeType: z.string().max(100),
  fileSize: z.coerce.number().int().min(1),
  thumbnailPath: z.string().max(500).optional().or(z.literal('')),
  caption: z.string().max(500).optional().or(z.literal('')),
});

export const DeleteAttachmentSchema = z.object({
  schoolId: z.string().uuid(),
  reportId: z.string().uuid(),
  attachmentId: z.string().uuid(),
});

export const DeleteTimelineEntrySchema = z.object({
  schoolId: z.string().uuid(),
  reportId: z.string().uuid(),
  entryId: z.string().uuid(),
});

export const FetchDailyReportBundleSchema = z.object({
  schoolId: z.string().uuid(),
  studentId: z.string().uuid(),
  reportDate: z.string().min(1),
});
