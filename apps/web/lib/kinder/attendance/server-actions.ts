'use server';

import { revalidatePath } from 'next/cache';

import { enhanceAction } from '@kit/next/actions';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import pathsConfig from '~/config/paths.config';

import {
  CheckInSchema,
  CheckOutSchema,
  CreateLeaveRequestSchema,
  RecordClassAttendanceSchema,
  ReviewLeaveRequestSchema,
} from './schemas/attendance.schema';

const ATTENDANCE_PATH = pathsConfig.app.attendance;

function revalidateAttendancePaths() {
  revalidatePath(ATTENDANCE_PATH);
}

function eachDateInRange(startDate: string, endDate: string) {
  const dates: string[] = [];
  const current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    dates.push(current.toISOString().slice(0, 10));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

/** ATT-004 Manual class attendance */
export const recordClassAttendanceAction = enhanceAction(
  async (data, user) => {
    const client = getSupabaseServerClient();

    const rows = data.records.map((record) => {
      const isLate = record.status === 'late';
      const checkInAt =
        record.checkInAt && record.status !== 'absent'
          ? new Date(record.checkInAt).toISOString()
          : record.status === 'present' || record.status === 'late'
            ? new Date().toISOString()
            : null;
      const checkOutAt =
        record.checkOutAt && record.status !== 'absent'
          ? new Date(record.checkOutAt).toISOString()
          : null;

      return {
        school_id: data.schoolId,
        student_id: record.studentId,
        class_id: data.classId,
        attendance_date: data.attendanceDate,
        status: record.status,
        check_in_at: checkInAt,
        check_out_at: checkOutAt,
        is_late: isLate,
        late_minutes: isLate ? (record.lateMinutes ?? 0) : 0,
        notes: record.notes || null,
        recorded_by: user.id,
      };
    });

    const { error } = await client.from('attendance_records').upsert(rows, {
      onConflict: 'school_id,student_id,attendance_date',
    });

    if (error) {
      throw error;
    }

    revalidateAttendancePaths();
    return { success: true };
  },
  { schema: RecordClassAttendanceSchema },
);

/** ATT-001 Check in */
export const checkInAction = enhanceAction(
  async (data, user) => {
    const client = getSupabaseServerClient();
    const isLate = data.isLate ?? false;
    const now = new Date().toISOString();

    const { error } = await client.from('attendance_records').upsert(
      {
        school_id: data.schoolId,
        student_id: data.studentId,
        class_id: data.classId,
        attendance_date: data.attendanceDate,
        status: isLate ? 'late' : 'present',
        check_in_at: now,
        is_late: isLate,
        late_minutes: isLate ? (data.lateMinutes ?? 0) : 0,
        recorded_by: user.id,
      },
      { onConflict: 'school_id,student_id,attendance_date' },
    );

    if (error) {
      throw error;
    }

    revalidateAttendancePaths();
    return { success: true };
  },
  { schema: CheckInSchema },
);

/** ATT-002 Check out */
export const checkOutAction = enhanceAction(
  async (data, user) => {
    const client = getSupabaseServerClient();
    const now = new Date().toISOString();

    const { data: existing, error: fetchError } = await client
      .from('attendance_records')
      .select('id, check_in_at, status')
      .eq('school_id', data.schoolId)
      .eq('student_id', data.studentId)
      .eq('attendance_date', data.attendanceDate)
      .maybeSingle();

    if (fetchError) {
      throw fetchError;
    }

    if (!existing?.check_in_at) {
      throw new Error('Student has not checked in yet');
    }

    const { error } = await client
      .from('attendance_records')
      .update({
        check_out_at: now,
        class_id: data.classId,
        recorded_by: user.id,
        status:
          existing.status === 'present' || existing.status === 'late'
            ? existing.status
            : 'early_leave',
      })
      .eq('id', existing.id);

    if (error) {
      throw error;
    }

    revalidateAttendancePaths();
    return { success: true };
  },
  { schema: CheckOutSchema },
);

/** ATT-005 Create leave request */
export const createLeaveRequestAction = enhanceAction(
  async (data, user) => {
    const client = getSupabaseServerClient();

    const { error } = await client.from('leave_requests').insert({
      school_id: data.schoolId,
      student_id: data.studentId,
      start_date: data.startDate,
      end_date: data.endDate,
      reason: data.reason || null,
      created_by: user.id,
    });

    if (error) {
      throw error;
    }

    revalidateAttendancePaths();
    return { success: true };
  },
  { schema: CreateLeaveRequestSchema },
);

/** ATT-005 Approve / reject leave */
export const reviewLeaveRequestAction = enhanceAction(
  async (data, user) => {
    const client = getSupabaseServerClient();

    const { data: request, error: fetchError } = await client
      .from('leave_requests')
      .select('*')
      .eq('id', data.leaveRequestId)
      .eq('school_id', data.schoolId)
      .single();

    if (fetchError || !request) {
      throw new Error('Leave request not found');
    }

    const { error } = await client
      .from('leave_requests')
      .update({
        status: data.status,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', data.leaveRequestId)
      .eq('school_id', data.schoolId);

    if (error) {
      throw error;
    }

    if (data.status === 'approved') {
      const dates = eachDateInRange(request.start_date, request.end_date);
      const { data: student } = await client
        .from('students')
        .select('current_class_id')
        .eq('id', request.student_id)
        .single();

      const rows = dates.map((date) => ({
        school_id: data.schoolId,
        student_id: request.student_id,
        class_id: student?.current_class_id ?? null,
        attendance_date: date,
        status: 'excused' as const,
        notes: request.reason,
        recorded_by: user.id,
      }));

      await client.from('attendance_records').upsert(rows, {
        onConflict: 'school_id,student_id,attendance_date',
      });
    }

    revalidateAttendancePaths();
    return { success: true };
  },
  { schema: ReviewLeaveRequestSchema },
);
