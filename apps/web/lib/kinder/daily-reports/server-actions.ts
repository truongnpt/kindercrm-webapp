'use server';

import { revalidatePath } from 'next/cache';

import { enhanceAction } from '@kit/next/actions';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import pathsConfig from '~/config/paths.config';
import { KINDER_ERROR_CODES, KinderError } from '~/lib/kinder/errors';

import {
  AcknowledgeDailyReportSchema,
  AddTimelineEntrySchema,
  BulkUpsertClassDailyReportsSchema,
  DeleteAttachmentSchema,
  DeleteTimelineEntrySchema,
  FetchDailyReportBundleSchema,
  PublishDailyReportSchema,
  RegisterAttachmentSchema,
  UpsertDailyReportSchema,
} from './schemas/daily-report.schema';
import { loadDailyReportBundle } from './load-daily-reports';
import { notifyParentsOfDailyReport } from '~/lib/kinder/notifications/load-notifications';
import { DAILY_REPORT_MEDIA_BUCKET } from './storage';

const DAILY_REPORTS_PATH = pathsConfig.app.dailyReports;

function revalidateDailyReportPaths(studentId?: string) {
  revalidatePath(DAILY_REPORTS_PATH);
  revalidatePath(pathsConfig.parent.home);

  if (studentId) {
    revalidatePath(`${pathsConfig.parent.child}/${studentId}`);
    revalidatePath(`${pathsConfig.app.studentDetail}/${studentId}`);
  }
}

function buildMealsSummary(
  mealRecords: Array<{ slot: string; consumed: string; notes?: string }>,
) {
  if (mealRecords.length === 0) {
    return null;
  }

  return mealRecords
    .map((meal) => `${meal.slot}: ${meal.consumed}${meal.notes ? ` (${meal.notes})` : ''}`)
    .join('\n');
}

function buildNapSummary(sleepRecord?: {
  from?: string;
  to?: string;
  quality?: string;
  notes?: string;
}) {
  if (!sleepRecord) {
    return null;
  }

  const parts = [
    sleepRecord.from && sleepRecord.to
      ? `${sleepRecord.from}–${sleepRecord.to}`
      : null,
    sleepRecord.quality,
    sleepRecord.notes,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(' · ') : null;
}

function buildActivitiesSummary(
  activities: Array<{ title: string; description?: string }>,
) {
  if (activities.length === 0) {
    return null;
  }

  return activities
    .map((activity) =>
      activity.description
        ? `${activity.title}: ${activity.description}`
        : activity.title,
    )
    .join('\n');
}

/** DAILY-001 Upsert daily report */
export const upsertDailyReportAction = enhanceAction(
  async (data, user) => {
    const client = getSupabaseServerClient();

    const mealsText =
      data.meals ||
      buildMealsSummary(data.mealRecords) ||
      null;
    const napText = data.nap || buildNapSummary(data.sleepRecord) || null;
    const activitiesText =
      data.activities || buildActivitiesSummary(data.learningActivities) || null;

    const { data: report, error } = await client
      .from('student_daily_reports')
      .upsert(
        {
          school_id: data.schoolId,
          student_id: data.studentId,
          report_date: data.reportDate,
          mood: data.mood || null,
          meals: mealsText,
          nap: napText,
          activities: activitiesText,
          teacher_note: data.teacherNote || null,
          daily_summary: data.dailySummary || null,
          meal_records: data.mealRecords,
          sleep_record: data.sleepRecord ?? null,
          toilet_records: data.toiletRecords,
          health_observation: data.healthObservation ?? null,
          medication_records: data.medicationRecords,
          learning_activities: data.learningActivities,
          created_by: user.id,
        },
        { onConflict: 'school_id,student_id,report_date' },
      )
      .select('id')
      .single();

    if (error) {
      throw error;
    }

    revalidateDailyReportPaths(data.studentId);
    return { success: true, reportId: report.id };
  },
  { schema: UpsertDailyReportSchema },
);

export const bulkUpsertClassDailyReportsAction = enhanceAction(
  async (data, user) => {
    const client = getSupabaseServerClient();

    const rows = data.reports.map((report) => ({
      school_id: data.schoolId,
      student_id: report.studentId,
      report_date: data.reportDate,
      mood: report.mood || null,
      teacher_note: report.teacherNote || null,
      daily_summary: report.dailySummary || null,
      created_by: user.id,
    }));

    const { error } = await client.from('student_daily_reports').upsert(rows, {
      onConflict: 'school_id,student_id,report_date',
    });

    if (error) {
      throw error;
    }

    revalidateDailyReportPaths();
    return { success: true };
  },
  { schema: BulkUpsertClassDailyReportsSchema },
);

/** DAILY-013 Publish daily report */
export const publishDailyReportAction = enhanceAction(
  async (data) => {
    const client = getSupabaseServerClient();

    const { data: report, error } = await client
      .from('student_daily_reports')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
      })
      .eq('school_id', data.schoolId)
      .eq('student_id', data.studentId)
      .eq('report_date', data.reportDate)
      .select('id, students(full_name)')
      .single();

    if (error) {
      throw error;
    }

    const studentRow = report.students as { full_name: string } | null;
    const studentName = studentRow?.full_name ?? 'Học sinh';

    await notifyParentsOfDailyReport({
      schoolId: data.schoolId,
      studentId: data.studentId,
      studentName,
      reportDate: data.reportDate,
      reportId: report.id,
    });

    revalidateDailyReportPaths(data.studentId);
    return { success: true };
  },
  { schema: PublishDailyReportSchema },
);

/** DAILY-012 Parent acknowledgement */
export const acknowledgeDailyReportAction = enhanceAction(
  async (data, user) => {
    const client = getSupabaseServerClient();

    const { data: report, error: fetchError } = await client
      .from('student_daily_reports')
      .select('id, student_id, status')
      .eq('id', data.reportId)
      .single();

    if (fetchError || !report) {
      throw new Error('Report not found');
    }

    const { data: link } = await client
      .from('parent_student_links')
      .select('id')
      .eq('user_id', user.id)
      .eq('student_id', report.student_id)
      .maybeSingle();

    if (!link) {
      throw new KinderError(
        KINDER_ERROR_CODES.PARENT_ACCESS_DENIED,
        'Access denied',
      );
    }

    const { error } = await client
      .from('student_daily_reports')
      .update({ parent_acknowledged_at: new Date().toISOString() })
      .eq('id', data.reportId);

    if (error) {
      throw error;
    }

    revalidateDailyReportPaths(report.student_id);
    return { success: true };
  },
  { schema: AcknowledgeDailyReportSchema },
);

/** DAILY-014 Timeline entry */
export const addTimelineEntryAction = enhanceAction(
  async (data, user) => {
    const client = getSupabaseServerClient();

    const { error } = await client.from('daily_report_timeline_entries').insert({
      school_id: data.schoolId,
      report_id: data.reportId,
      entry_type: data.entryType,
      title: data.title,
      content: data.content || null,
      recorded_at: data.recordedAt
        ? new Date(data.recordedAt).toISOString()
        : new Date().toISOString(),
      created_by: user.id,
    });

    if (error) {
      throw error;
    }

    revalidateDailyReportPaths();
    return { success: true };
  },
  { schema: AddTimelineEntrySchema },
);

async function assertReportSchoolAccess(
  client: ReturnType<typeof getSupabaseServerClient>,
  schoolId: string,
  reportId: string,
) {
  const { data, error } = await client
    .from('student_daily_reports')
    .select('id, school_id')
    .eq('id', reportId)
    .eq('school_id', schoolId)
    .single();

  if (error || !data) {
    throw new Error('Daily report not found');
  }

  return data;
}

/** DAILY-015 Register uploaded media */
export const registerDailyReportAttachmentAction = enhanceAction(
  async (data, user) => {
    const client = getSupabaseServerClient();
    await assertReportSchoolAccess(client, data.schoolId, data.reportId);

    const { data: attachment, error } = await client
      .from('daily_report_attachments')
      .insert({
        school_id: data.schoolId,
        report_id: data.reportId,
        storage_path: data.storagePath,
        file_name: data.fileName,
        media_type: data.mediaType,
        mime_type: data.mimeType,
        file_size: data.fileSize,
        thumbnail_path: data.thumbnailPath || null,
        caption: data.caption || null,
        created_by: user.id,
      })
      .select('id')
      .single();

    if (error) {
      throw error;
    }

    revalidateDailyReportPaths();
    return { success: true, attachmentId: attachment?.id };
  },
  { schema: RegisterAttachmentSchema },
);

export const deleteDailyReportAttachmentAction = enhanceAction(
  async (data) => {
    const client = getSupabaseServerClient();
    await assertReportSchoolAccess(client, data.schoolId, data.reportId);

    const { data: attachment, error: fetchError } = await client
      .from('daily_report_attachments')
      .select('storage_path')
      .eq('id', data.attachmentId)
      .eq('report_id', data.reportId)
      .eq('school_id', data.schoolId)
      .single();

    if (fetchError || !attachment) {
      throw new Error('Attachment not found');
    }

    const { error: deleteRowError } = await client
      .from('daily_report_attachments')
      .delete()
      .eq('id', data.attachmentId);

    if (deleteRowError) {
      throw deleteRowError;
    }

    await client.storage
      .from(DAILY_REPORT_MEDIA_BUCKET)
      .remove([attachment.storage_path]);

    revalidateDailyReportPaths();
    return { success: true };
  },
  { schema: DeleteAttachmentSchema },
);

export const deleteTimelineEntryAction = enhanceAction(
  async (data) => {
    const client = getSupabaseServerClient();
    await assertReportSchoolAccess(client, data.schoolId, data.reportId);

    const { error } = await client
      .from('daily_report_timeline_entries')
      .delete()
      .eq('id', data.entryId)
      .eq('report_id', data.reportId)
      .eq('school_id', data.schoolId);

    if (error) {
      throw error;
    }

    revalidateDailyReportPaths();
    return { success: true };
  },
  { schema: DeleteTimelineEntrySchema },
);

export const fetchDailyReportBundleAction = enhanceAction(
  async (data) => {
    return loadDailyReportBundle(
      data.schoolId,
      data.studentId,
      data.reportDate,
    );
  },
  { schema: FetchDailyReportBundleSchema },
);
