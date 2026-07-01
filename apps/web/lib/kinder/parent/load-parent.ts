import 'server-only';

import { cache } from 'react';

import { getSupabaseServerClient } from '@kit/supabase/server-client';

import { KINDER_ERROR_CODES, KinderError } from '~/lib/kinder/errors';

import type { ParentChildSummary, ParentStudentLink } from './types';

export type { StudentDailyReport } from '~/lib/kinder/daily-reports/types';

export const loadParentLinksForUser = cache(async (userId: string) => {
  const client = getSupabaseServerClient();

  const { data, error } = await client
    .from('parent_student_links')
    .select(
      `
      id,
      school_id,
      student_id,
      is_primary,
      relationship,
      student:students!inner (
        id,
        student_code,
        full_name,
        class_name,
        photo_url,
        deleted_at
      ),
      school:schools!inner (
        id,
        name
      )
    `,
    )
    .eq('user_id', userId);

  if (error) {
    throw error;
  }

  return (data ?? [])
    .filter((row) => {
      const student = row.student as { deleted_at: string | null };

      return !student.deleted_at;
    })
    .map((row) => {
      const student = row.student as {
        id: string;
        student_code: string;
        full_name: string;
        class_name: string | null;
        photo_url: string | null;
      };
      const school = row.school as { id: string; name: string };

      return {
        linkId: row.id,
        studentId: student.id,
        schoolId: school.id,
        schoolName: school.name,
        studentCode: student.student_code,
        fullName: student.full_name,
        className: student.class_name,
        photoUrl: student.photo_url,
        isPrimary: row.is_primary,
      } satisfies ParentChildSummary;
    });
});

export const loadParentLinksForStudent = cache(
  async (schoolId: string, studentId: string) => {
    const client = getSupabaseServerClient();

    const { data: links, error } = await client
      .from('parent_student_links')
      .select('*')
      .eq('school_id', schoolId)
      .eq('student_id', studentId);

    if (error) {
      throw error;
    }

    if (!links || links.length === 0) {
      return [];
    }

    const userIds = links.map((link) => link.user_id);

    const { data: accounts } = await client
      .from('accounts')
      .select('id, name, email')
      .in('id', userIds);

    const accountById = new Map((accounts ?? []).map((a) => [a.id, a]));

    return links.map((link) => ({
      ...link,
      account: accountById.get(link.user_id) ?? null,
    }));
  },
);

export async function assertParentStudentAccess(
  userId: string,
  studentId: string,
) {
  const client = getSupabaseServerClient();

  const { data, error } = await client
    .from('parent_student_links')
    .select('id, school_id')
    .eq('user_id', userId)
    .eq('student_id', studentId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new KinderError(
      KINDER_ERROR_CODES.PARENT_ACCESS_DENIED,
      'You do not have access to this student',
    );
  }

  return data;
}

export const loadParentStudentProfile = cache(
  async (userId: string, studentId: string) => {
    await assertParentStudentAccess(userId, studentId);

    const client = getSupabaseServerClient();

    const { data, error } = await client
      .from('students')
      .select('*')
      .eq('id', studentId)
      .is('deleted_at', null)
      .single();

    if (error) {
      throw error;
    }

    return data;
  },
);

export const loadParentStudentAttendance = cache(
  async (userId: string, studentId: string, limit = 30) => {
    await assertParentStudentAccess(userId, studentId);

    const client = getSupabaseServerClient();

    const { data, error } = await client
      .from('attendance_records')
      .select('*')
      .eq('student_id', studentId)
      .order('attendance_date', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return data ?? [];
  },
);

export const loadParentStudentInvoices = cache(
  async (userId: string, studentId: string) => {
    await assertParentStudentAccess(userId, studentId);

    const client = getSupabaseServerClient();

    const { data, error } = await client
      .from('invoices')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data ?? [];
  },
);

export {
  loadParentDailyReports,
  loadStudentDailyReports,
} from '~/lib/kinder/daily-reports/load-daily-reports';

export async function resolvePostLoginPath(userId: string) {
  const client = getSupabaseServerClient();

  const { data: memberships, error } = await client
    .from('school_members')
    .select('role')
    .eq('user_id', userId)
    .is('deleted_at', null);

  if (error) {
    throw error;
  }

  const hasStaffMembership = (memberships ?? []).some(
    (membership) => membership.role !== 'parent',
  );

  if (hasStaffMembership) {
    return '/app';
  }

  const { count: parentCount } = await client
    .from('parent_student_links')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);

  if ((parentCount ?? 0) > 0) {
    return '/parent';
  }

  return '/app';
}
