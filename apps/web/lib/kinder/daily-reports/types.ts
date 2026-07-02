import type { Database } from '~/lib/database.types';

export type StudentDailyReport =
  Database['public']['Tables']['student_daily_reports']['Row'];

export type DailyReportTimelineEntry =
  Database['public']['Tables']['daily_report_timeline_entries']['Row'];

export type DailyReportAttachment =
  Database['public']['Tables']['daily_report_attachments']['Row'];

export type MealRecord = {
  slot: 'breakfast' | 'lunch' | 'snack';
  consumed: 'full' | 'half' | 'none' | 'refused';
  notes?: string;
};

export type SleepRecord = {
  from?: string;
  to?: string;
  quality?: string;
  notes?: string;
};

export type ToiletRecord = {
  type: 'wet' | 'dry' | 'bm';
  time?: string;
  notes?: string;
};

export type HealthObservation = {
  temperature?: number;
  symptoms?: string;
  notes?: string;
};

export type MedicationRecord = {
  name: string;
  dosage?: string;
  time?: string;
  notes?: string;
};

export type LearningActivity = {
  title: string;
  description?: string;
};

export type ClassDailyReportStudent = {
  studentId: string;
  fullName: string;
  studentCode: string;
  report: StudentDailyReport | null;
};

export type DailyReportsClassSummary = {
  classId: string;
  className: string;
  classCode: string;
  totalStudents: number;
  publishedCount: number;
  draftCount: number;
  missingCount: number;
};

export type DailyReportsDaySummary = {
  reportDate: string;
  classId: string | null;
  className: string | null;
  totalStudents: number;
  publishedCount: number;
  draftCount: number;
  missingCount: number;
  completionRate: number;
  activeClasses: number;
};
