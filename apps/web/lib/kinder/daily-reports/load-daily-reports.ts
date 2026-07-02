import 'server-only';

import { cache } from 'react';

import { getSupabaseServerClient } from '@kit/supabase/server-client';

import { loadActiveClasses } from '~/lib/kinder/attendance/load-attendance';

import type {
  ClassDailyReportStudent,
  DailyReportAttachment,
  DailyReportTimelineEntry,
  DailyReportsClassSummary,
  DailyReportsDaySummary,
  StudentDailyReport,
} from './types';

export { loadActiveClasses };

export const loadDailyReportsForClassDate = cache(
  async (schoolId: string, classId: string, reportDate: string) => {
    const client = getSupabaseServerClient();

    const { data: enrollments, error: enrollError } = await client
      .from('class_enrollments')
      .select(
        `
        student_id,
        student:students!inner (
          id,
          full_name,
          student_code,
          deleted_at
        )
      `,
      )
      .eq('school_id', schoolId)
      .eq('class_id', classId)
      .eq('status', 'active');

    if (enrollError) {
      throw enrollError;
    }

    const studentIds = (enrollments ?? [])
      .filter((row) => {
        const student = row.student as { deleted_at: string | null };

        return !student.deleted_at;
      })
      .map((row) => row.student_id);

    const { data: reports, error: reportsError } = await client
      .from('student_daily_reports')
      .select('*')
      .eq('school_id', schoolId)
      .eq('report_date', reportDate)
      .in('student_id', studentIds.length > 0 ? studentIds : ['00000000-0000-0000-0000-000000000000']);

    if (reportsError) {
      throw reportsError;
    }

    const reportByStudent = new Map(
      (reports ?? []).map((report) => [
        report.student_id,
        report as StudentDailyReport,
      ]),
    );

    const roster: ClassDailyReportStudent[] = (enrollments ?? [])
      .filter((row) => {
        const student = row.student as { deleted_at: string | null };

        return !student.deleted_at;
      })
      .map((enrollment) => {
        const student = enrollment.student as {
          id: string;
          full_name: string;
          student_code: string;
        };

        return {
          studentId: student.id,
          fullName: student.full_name,
          studentCode: student.student_code,
          report: reportByStudent.get(student.id) ?? null,
        };
      });

    roster.sort((a, b) => a.fullName.localeCompare(b.fullName));

    return roster;
  },
);

export const loadStudentDailyReport = cache(
  async (schoolId: string, studentId: string, reportDate: string) => {
    const client = getSupabaseServerClient();

    const { data, error } = await client
      .from('student_daily_reports')
      .select('*')
      .eq('school_id', schoolId)
      .eq('student_id', studentId)
      .eq('report_date', reportDate)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return (data as StudentDailyReport | null) ?? null;
  },
);

export const loadStudentDailyReports = cache(
  async (schoolId: string, studentId: string, limit = 14) => {
    const client = getSupabaseServerClient();

    const { data, error } = await client
      .from('student_daily_reports')
      .select('*')
      .eq('school_id', schoolId)
      .eq('student_id', studentId)
      .order('report_date', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return (data ?? []) as StudentDailyReport[];
  },
);

export const loadDailyReportTimeline = cache(async (reportId: string) => {
  const client = getSupabaseServerClient();

  const { data, error } = await client
    .from('daily_report_timeline_entries')
    .select('*')
    .eq('report_id', reportId)
    .order('recorded_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as DailyReportTimelineEntry[];
});

export const loadDailyReportAttachments = cache(async (reportId: string) => {
  const client = getSupabaseServerClient();

  const { data, error } = await client
    .from('daily_report_attachments')
    .select('*')
    .eq('report_id', reportId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as DailyReportAttachment[];
});

export const loadDailyReportAttachmentsMap = cache(
  async (reportIds: string[]) => {
    if (reportIds.length === 0) {
      return {} as Record<string, DailyReportAttachment[]>;
    }

    const client = getSupabaseServerClient();

    const { data, error } = await client
      .from('daily_report_attachments')
      .select('*')
      .in('report_id', reportIds)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    const map: Record<string, DailyReportAttachment[]> = Object.fromEntries(
      reportIds.map((id) => [id, []]),
    );

    for (const row of data ?? []) {
      const attachment = row as DailyReportAttachment;
      const list = map[attachment.report_id] ?? [];
      list.push(attachment);
      map[attachment.report_id] = list;
    }

    return map;
  },
);

export const loadDailyReportBundle = cache(
  async (schoolId: string, studentId: string, reportDate: string) => {
    const report = await loadStudentDailyReport(schoolId, studentId, reportDate);

    if (!report) {
      return null;
    }

    const [timeline, attachments] = await Promise.all([
      loadDailyReportTimeline(report.id),
      loadDailyReportAttachments(report.id),
    ]);

    return { report, timeline, attachments };
  },
);

export const loadParentDailyReportAttachments = cache(async (reportId: string) => {
  return loadDailyReportAttachments(reportId);
});

function summarizeRoster(roster: ClassDailyReportStudent[]) {
  const publishedCount = roster.filter(
    (student) => student.report?.status === 'published',
  ).length;
  const draftCount = roster.filter(
    (student) =>
      student.report != null && student.report.status !== 'published',
  ).length;
  const missingCount = roster.filter((student) => !student.report).length;

  return {
    totalStudents: roster.length,
    publishedCount,
    draftCount,
    missingCount,
  };
}

export function buildDailyReportsDaySummary(input: {
  reportDate: string;
  classId: string | null;
  className: string | null;
  roster: ClassDailyReportStudent[];
  activeClasses: number;
}): DailyReportsDaySummary {
  const counts = summarizeRoster(input.roster);
  const completionRate =
    counts.totalStudents > 0
      ? Math.round((counts.publishedCount / counts.totalStudents) * 100)
      : 0;

  return {
    reportDate: input.reportDate,
    classId: input.classId,
    className: input.className,
    activeClasses: input.activeClasses,
    completionRate,
    ...counts,
  };
}

export const loadDailyReportsOverviewForDate = cache(
  async (schoolId: string, reportDate: string) => {
    const classes = await loadActiveClasses(schoolId);

    const summaries: DailyReportsClassSummary[] = await Promise.all(
      classes.map(async (cls) => {
        const roster = await loadDailyReportsForClassDate(
          schoolId,
          cls.id,
          reportDate,
        );
        const counts = summarizeRoster(roster);

        return {
          classId: cls.id,
          className: cls.name,
          classCode: cls.code,
          ...counts,
        };
      }),
    );

    return summaries;
  },
);

export const loadParentDailyReports = cache(
  async (userId: string, studentId: string, limit = 14) => {
    const client = getSupabaseServerClient();

    const { data: link } = await client
      .from('parent_student_links')
      .select('id')
      .eq('user_id', userId)
      .eq('student_id', studentId)
      .maybeSingle();

    if (!link) {
      return [];
    }

    const { data, error } = await client
      .from('student_daily_reports')
      .select('*')
      .eq('student_id', studentId)
      .eq('status', 'published')
      .order('report_date', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return (data ?? []) as StudentDailyReport[];
  },
);
