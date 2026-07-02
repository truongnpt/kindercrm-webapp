import 'server-only';

import { cache } from 'react';

import { getSupabaseServerClient } from '@kit/supabase/server-client';

import type { Database } from '~/lib/database.types';

import { loadClasses } from '~/lib/kinder/classes/load-classes';
import { ensureDefaultSchoolYear } from '~/lib/kinder/classes/seed-school-year';

import type {
  AttendanceDaySummary,
  AttendanceMonthlySummary,
  AttendanceRecord,
  ClassRosterStudent,
  LeaveRequestWithStudent,
} from './types';

export const loadActiveClasses = cache(async (schoolId: string) => {
  const client = getSupabaseServerClient();
  await ensureDefaultSchoolYear(client, schoolId);

  const schoolYears = await client
    .from('school_years')
    .select('id, is_current')
    .eq('school_id', schoolId)
    .order('start_date', { ascending: false });

  const currentYear =
    schoolYears.data?.find((year) => year.is_current) ?? schoolYears.data?.[0];

  if (!currentYear) {
    return [];
  }

  return (await loadClasses(schoolId, currentYear.id)).filter(
    (cls) => cls.status === 'active',
  );
});

export const loadAttendanceForClassDate = cache(
  async (schoolId: string, classId: string, attendanceDate: string) => {
    const client = getSupabaseServerClient();

    const { data: enrollments, error: enrollError } = await client
      .from('class_enrollments')
      .select(
        `
        student_id,
        student:students!inner (
          id,
          full_name,
          student_code
        )
      `,
      )
      .eq('school_id', schoolId)
      .eq('class_id', classId)
      .eq('status', 'active');

    if (enrollError) {
      throw enrollError;
    }

    const { data: records, error: recordsError } = await client
      .from('attendance_records')
      .select('*')
      .eq('school_id', schoolId)
      .eq('class_id', classId)
      .eq('attendance_date', attendanceDate);

    if (recordsError) {
      throw recordsError;
    }

    const recordByStudent = new Map(
      (records ?? []).map((record) => [record.student_id, record as AttendanceRecord]),
    );

    const roster: ClassRosterStudent[] = (enrollments ?? []).map((enrollment) => {
      const student = enrollment.student as {
        id: string;
        full_name: string;
        student_code: string;
      };

      return {
        studentId: student.id,
        fullName: student.full_name,
        studentCode: student.student_code,
        record: recordByStudent.get(student.id) ?? null,
      };
    });

    roster.sort((a, b) => a.fullName.localeCompare(b.fullName));

    return roster;
  },
);

export function buildAttendanceDaySummary(input: {
  date: string;
  classId: string | null;
  className: string | null;
  roster: ClassRosterStudent[];
  pendingLeave: number;
  activeClasses: number;
}): AttendanceDaySummary {
  const attendedStatuses = new Set(['present', 'late', 'early_leave']);
  const present = input.roster.filter((student) =>
    attendedStatuses.has(student.record?.status ?? ''),
  ).length;
  const absent = input.roster.filter(
    (student) => student.record?.status === 'absent',
  ).length;
  const late = input.roster.filter(
    (student) => student.record?.status === 'late',
  ).length;
  const excused = input.roster.filter(
    (student) => student.record?.status === 'excused',
  ).length;
  const marked = input.roster.filter((student) => student.record).length;
  const enrolled = input.roster.length;
  const attendanceRate =
    enrolled > 0 ? Math.round((present / enrolled) * 100) : 0;

  return {
    date: input.date,
    classId: input.classId,
    className: input.className,
    enrolled,
    marked,
    present,
    absent,
    late,
    excused,
    attendanceRate,
    pendingLeave: input.pendingLeave,
    activeClasses: input.activeClasses,
  };
}

export const loadLeaveRequests = cache(async (schoolId: string, status?: string) => {
  const client = getSupabaseServerClient();

  let query = client
    .from('leave_requests')
    .select(
      `
      *,
      student:students!inner (
        id,
        full_name,
        student_code,
        class_name
      )
    `,
    )
    .eq('school_id', schoolId)
    .order('created_at', { ascending: false });

  if (status && status !== 'all') {
    query = query.eq(
      'status',
      status as Database['public']['Enums']['leave_request_status'],
    );
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []) as LeaveRequestWithStudent[];
});

export const loadAttendanceMonthlySummary = cache(
  async (
    schoolId: string,
    month: string,
    classId?: string,
  ): Promise<AttendanceMonthlySummary> => {
    const client = getSupabaseServerClient();

    let query = client
      .from('attendance_records')
      .select('status, class_id')
      .eq('school_id', schoolId)
      .gte('attendance_date', `${month}-01`)
      .lte('attendance_date', `${month}-31`);

    if (classId) {
      query = query.eq('class_id', classId);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    const records = data ?? [];
    const presentCount = records.filter((r) => r.status === 'present').length;
    const absentCount = records.filter((r) => r.status === 'absent').length;
    const lateCount = records.filter((r) => r.status === 'late').length;
    const excusedCount = records.filter((r) => r.status === 'excused').length;
    const earlyLeaveCount = records.filter(
      (r) => r.status === 'early_leave',
    ).length;
    const totalRecords = records.length;
    const attendedCount = presentCount + lateCount + earlyLeaveCount;
    const attendanceRate =
      totalRecords > 0 ? Math.round((attendedCount / totalRecords) * 100) : 0;

    let className: string | null = null;

    if (classId) {
      const { data: cls } = await client
        .from('classes')
        .select('name')
        .eq('id', classId)
        .eq('school_id', schoolId)
        .maybeSingle();

      className = cls?.name ?? null;
    }

    return {
      month,
      classId: classId ?? null,
      className,
      totalRecords,
      presentCount,
      absentCount,
      lateCount,
      excusedCount,
      earlyLeaveCount,
      attendanceRate,
    };
  },
);

export const loadStudentsForLeaveRequest = cache(async (schoolId: string) => {
  const client = getSupabaseServerClient();

  const { data, error } = await client
    .from('students')
    .select('id, full_name, student_code, class_name')
    .eq('school_id', schoolId)
    .eq('status', 'active')
    .is('deleted_at', null)
    .order('full_name');

  if (error) {
    throw error;
  }

  return data ?? [];
});
