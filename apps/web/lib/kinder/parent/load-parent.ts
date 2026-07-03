import 'server-only';

import { cache } from 'react';

import { getSupabaseServerClient } from '@kit/supabase/server-client';

import { getSchoolMemberAccounts } from '~/lib/kinder/tenant/account-lookup';

import { KINDER_ERROR_CODES, KinderError } from '~/lib/kinder/errors';

import type { ParentChildSummary, ParentHomeroomTeacher } from './types';

export type { StudentDailyReport } from '~/lib/kinder/daily-reports/types';

async function loadHomeroomTeacherForClass(
  schoolId: string,
  classId: string | null,
) {
  if (!classId) {
    return {
      homeroomTeacher: null,
      homeroomClassName: null,
    };
  }

  const client = getSupabaseServerClient();

  const { data: cls, error: classError } = await client
    .from('classes')
    .select('name, teacher_user_id')
    .eq('id', classId)
    .maybeSingle();

  if (classError) {
    throw classError;
  }

  if (!cls) {
    return {
      homeroomTeacher: null,
      homeroomClassName: null,
    };
  }

  let homeroomTeacher: ParentHomeroomTeacher | null = null;

  if (cls.teacher_user_id) {
    const { data: employee, error: employeeError } = await client
      .from('staff_employees')
      .select('full_name, phone, email, photo_url')
      .eq('school_id', schoolId)
      .eq('user_id', cls.teacher_user_id)
      .is('deleted_at', null)
      .maybeSingle();

    if (employeeError) {
      throw employeeError;
    }

    if (employee) {
      homeroomTeacher = {
        name: employee.full_name,
        phone: employee.phone,
        email: employee.email,
        photoUrl: employee.photo_url,
      };
    }
  }

  return {
    homeroomTeacher,
    homeroomClassName: cls.name,
  };
}

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
    const accounts = await getSchoolMemberAccounts(schoolId, userIds);

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

export const loadParentStudentContracts = cache(
  async (userId: string, studentId: string) => {
    await assertParentStudentAccess(userId, studentId);

    const client = getSupabaseServerClient();

    const { data, error } = await client
      .from('student_contracts')
      .select(
        `
        *,
        invoice:invoices (
          id,
          invoice_number,
          title,
          status,
          total_amount,
          paid_amount,
          due_date
        )
      `,
      )
      .eq('student_id', studentId)
      .in('status', ['active', 'expired', 'terminated'])
      .order('start_date', { ascending: false });

    if (error) {
      throw error;
    }

    return data ?? [];
  },
);

export const loadParentLeaveRequests = cache(
  async (userId: string, studentId: string) => {
    await assertParentStudentAccess(userId, studentId);

    const client = getSupabaseServerClient();

    const { data, error } = await client
      .from('leave_requests')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data ?? [];
  },
);

export const loadParentStudentInvoicePayments = cache(
  async (userId: string, studentId: string) => {
    await assertParentStudentAccess(userId, studentId);

    const client = getSupabaseServerClient();
    const { data: invoices, error: invoicesError } = await client
      .from('invoices')
      .select('id')
      .eq('student_id', studentId);

    if (invoicesError) {
      throw invoicesError;
    }

    const invoiceIds = (invoices ?? []).map((invoice) => invoice.id);

    if (invoiceIds.length === 0) {
      return [];
    }

    const { data, error } = await client
      .from('invoice_payments')
      .select('*')
      .in('invoice_id', invoiceIds)
      .order('paid_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data ?? [];
  },
);

export const loadParentStudentDetail = cache(
  async (userId: string, studentId: string) => {
    const link = await assertParentStudentAccess(userId, studentId);
    const client = getSupabaseServerClient();

    const [pickupPersons, parents, emergencyContacts, student] =
      await Promise.all([
        client
          .from('student_pickup_persons')
          .select('*')
          .eq('student_id', studentId)
          .order('full_name'),
        client
          .from('student_parents')
          .select('*')
          .eq('student_id', studentId)
          .order('is_primary', { ascending: false }),
        client
          .from('student_emergency_contacts')
          .select('*')
          .eq('student_id', studentId),
        client
          .from('students')
          .select('current_class_id, school_id')
          .eq('id', studentId)
          .single(),
      ]);

    if (pickupPersons.error) {
      throw pickupPersons.error;
    }

    if (parents.error) {
      throw parents.error;
    }

    if (emergencyContacts.error) {
      throw emergencyContacts.error;
    }

    if (student.error) {
      throw student.error;
    }

    let homeroomTeacher: ParentHomeroomTeacher | null = null;
    let homeroomClassName: string | null = null;

    const homeroom = await loadHomeroomTeacherForClass(
      link.school_id,
      student.data.current_class_id,
    );

    homeroomTeacher = homeroom.homeroomTeacher;
    homeroomClassName = homeroom.homeroomClassName;

    return {
      pickupPersons: pickupPersons.data ?? [],
      parents: parents.data ?? [],
      emergencyContacts: emergencyContacts.data ?? [],
      homeroomTeacher,
      homeroomClassName,
    };
  },
);

export {
  loadParentDailyReports,
  loadStudentDailyReports,
} from '~/lib/kinder/daily-reports/load-daily-reports';
