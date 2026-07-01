import 'server-only';

import { cache } from 'react';

import { getSupabaseServerClient } from '@kit/supabase/server-client';

import { getSchoolMemberAccounts } from '~/lib/kinder/tenant/account-lookup';

import type { Database } from '~/lib/database.types';

import type {
  StaffClassAssignment,
  StaffContract,
  StaffDepartment,
  StaffEmployeeDetail,
  StaffEmployeeListItem,
  StaffHomeroomClass,
  StaffPosition,
} from './types';

export const loadStaffDepartments = cache(async (schoolId: string) => {
  const client = getSupabaseServerClient();

  const { data, error } = await client
    .from('staff_departments')
    .select('*')
    .eq('school_id', schoolId)
    .order('sort_order')
    .order('name');

  if (error) {
    throw error;
  }

  return (data ?? []) as StaffDepartment[];
});

export const loadStaffPositions = cache(async (schoolId: string) => {
  const client = getSupabaseServerClient();

  const { data, error } = await client
    .from('staff_positions')
    .select('*')
    .eq('school_id', schoolId)
    .order('name');

  if (error) {
    throw error;
  }

  return (data ?? []) as StaffPosition[];
});

export const loadStaffEmployees = cache(
  async (
    schoolId: string,
    filters?: {
      status?: string;
      departmentId?: string;
      teachersOnly?: boolean;
      search?: string;
    },
  ) => {
    const client = getSupabaseServerClient();

    let query = client
      .from('staff_employees')
      .select(
        `
        *,
        department:staff_departments (id, name),
        position:staff_positions (id, name),
        campus:campuses (id, name)
      `,
      )
      .eq('school_id', schoolId)
      .is('deleted_at', null)
      .order('full_name');

    if (filters?.status && filters.status !== 'all') {
      query = query.eq(
        'employment_status',
        filters.status as Database['public']['Enums']['staff_employment_status'],
      );
    }

    if (filters?.departmentId) {
      query = query.eq('department_id', filters.departmentId);
    }

    if (filters?.teachersOnly) {
      query = query.eq('is_teacher', true);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    let employees = (data ?? []) as StaffEmployeeListItem[];

    if (filters?.search) {
      const term = filters.search.toLowerCase();

      employees = employees.filter(
        (employee) =>
          employee.full_name.toLowerCase().includes(term) ||
          employee.employee_code.toLowerCase().includes(term) ||
          (employee.email?.toLowerCase().includes(term) ?? false),
      );
    }

    return employees;
  },
);

export const loadStaffEmployeeById = cache(
  async (schoolId: string, employeeId: string) => {
    const client = getSupabaseServerClient();

    const { data, error } = await client
      .from('staff_employees')
      .select(
        `
        *,
        department:staff_departments (id, name),
        position:staff_positions (id, name),
        campus:campuses (id, name)
      `,
      )
      .eq('school_id', schoolId)
      .eq('id', employeeId)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return null;
    }

    let account = null;

    if (data.user_id) {
      const accounts = await getSchoolMemberAccounts(schoolId, [data.user_id]);
      account = accounts[0] ?? null;
    }

    return {
      ...data,
      account,
    } as StaffEmployeeDetail;
  },
);

export const loadStaffContracts = cache(
  async (schoolId: string, employeeId: string) => {
    const client = getSupabaseServerClient();

    const { data, error } = await client
      .from('staff_contracts')
      .select('*')
      .eq('school_id', schoolId)
      .eq('employee_id', employeeId)
      .order('start_date', { ascending: false });

    if (error) {
      throw error;
    }

    return (data ?? []) as StaffContract[];
  },
);

export const loadStaffClassAssignments = cache(
  async (schoolId: string, employeeId: string) => {
    const client = getSupabaseServerClient();

    const { data, error } = await client
      .from('staff_class_assignments')
      .select(
        `
        *,
        class:classes (id, name, code, status)
      `,
      )
      .eq('school_id', schoolId)
      .eq('employee_id', employeeId)
      .order('assigned_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data ?? [];
  },
);

export const loadStaffHomeroomClasses = cache(
  async (schoolId: string, userId: string | null) => {
    if (!userId) {
      return [] as StaffHomeroomClass[];
    }

    const client = getSupabaseServerClient();

    const { data, error } = await client
      .from('classes')
      .select('id, name, code, status')
      .eq('school_id', schoolId)
      .eq('teacher_user_id', userId)
      .is('deleted_at', null)
      .order('name');

    if (error) {
      throw error;
    }

    return (data ?? []) as StaffHomeroomClass[];
  },
);

export const loadTeachersForSchool = cache(async (schoolId: string) => {
  const client = getSupabaseServerClient();

  const { data, error } = await client
    .from('staff_employees')
    .select('user_id, full_name, email')
    .eq('school_id', schoolId)
    .eq('is_teacher', true)
    .eq('employment_status', 'active')
    .is('deleted_at', null)
    .not('user_id', 'is', null)
    .order('full_name');

  if (error) {
    throw error;
  }

  return (data ?? []).map((teacher) => ({
    id: teacher.user_id!,
    name: teacher.full_name,
    email: teacher.email,
  }));
});

export const countStaffEmployees = cache(async (schoolId: string) => {
  const client = getSupabaseServerClient();

  const { count, error } = await client
    .from('staff_employees')
    .select('id', { count: 'exact', head: true })
    .eq('school_id', schoolId)
    .is('deleted_at', null);

  if (error) {
    throw error;
  }

  return count ?? 0;
});

export const loadActiveClassesForStaff = cache(async (schoolId: string) => {
  const client = getSupabaseServerClient();

  const { data, error } = await client
    .from('classes')
    .select('id, name, code')
    .eq('school_id', schoolId)
    .eq('status', 'active')
    .is('deleted_at', null)
    .order('name');

  if (error) {
    throw error;
  }

  return data ?? [];
});

export type StaffClassAssignmentWithClass = StaffClassAssignment & {
  class: StaffHomeroomClass;
};
