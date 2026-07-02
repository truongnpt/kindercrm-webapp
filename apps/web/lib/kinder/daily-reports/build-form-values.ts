import type { UpsertDailyReportFormValues } from './schemas/daily-report.schema';
import type { MealRecord, StudentDailyReport } from './types';

const MEAL_SLOTS = ['breakfast', 'lunch', 'snack'] as const;

function parseJsonArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) {
    return value as T[];
  }

  return [];
}

function parseJsonObject<T>(value: unknown): T | undefined {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as T;
  }

  return undefined;
}

export function buildDailyReportFormValues(
  schoolId: string,
  studentId: string,
  reportDate: string,
  report: StudentDailyReport | null,
): UpsertDailyReportFormValues {
  const mealRecords = parseJsonArray<MealRecord>(report?.meal_records);
  const normalizedMeals: MealRecord[] = MEAL_SLOTS.map((slot) => {
    const existing = mealRecords.find((meal) => meal.slot === slot);

    return (
      existing ?? {
        slot,
        consumed: 'full' as const,
        notes: '',
      }
    );
  });

  return {
    schoolId,
    studentId,
    reportDate,
    mood: report?.mood ?? '',
    teacherNote: report?.teacher_note ?? '',
    dailySummary: report?.daily_summary ?? '',
    meals: report?.meals ?? '',
    nap: report?.nap ?? '',
    activities: report?.activities ?? '',
    mealRecords: normalizedMeals,
    sleepRecord: parseJsonObject<{
      from?: string;
      to?: string;
      quality?: string;
      notes?: string;
    }>(report?.sleep_record) ?? { from: '', to: '', notes: '' },
    toiletRecords: parseJsonArray<{
      type: 'wet' | 'dry' | 'bm';
      time?: string;
      notes?: string;
    }>(report?.toilet_records),
    healthObservation: (() => {
      const raw = parseJsonObject<{
        temperature?: number | string | null;
        symptoms?: string | null;
        notes?: string | null;
      }>(report?.health_observation);

      if (!raw) {
        return { symptoms: '', notes: '' };
      }

      const temperature =
        typeof raw.temperature === 'number' &&
        !Number.isNaN(raw.temperature) &&
        raw.temperature >= 35 &&
        raw.temperature <= 42
          ? raw.temperature
          : undefined;

      return {
        ...(temperature !== undefined ? { temperature } : {}),
        symptoms: raw.symptoms ?? '',
        notes: raw.notes ?? '',
      };
    })(),
    medicationRecords: parseJsonArray<{
      name: string;
      dosage?: string;
      time?: string;
      notes?: string;
    }>(report?.medication_records),
    learningActivities: parseJsonArray<{
      title: string;
      description?: string;
    }>(report?.learning_activities),
  };
}

export function buildEmptyDailyReportFormValues(
  schoolId: string,
  studentId: string,
  reportDate = new Date().toISOString().slice(0, 10),
): UpsertDailyReportFormValues {
  return buildDailyReportFormValues(schoolId, studentId, reportDate, null);
}
