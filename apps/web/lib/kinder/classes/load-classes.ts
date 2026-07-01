import 'server-only';

import { cache } from 'react';

import { getSupabaseServerClient } from '@kit/supabase/server-client';

import type {
  ClassEnrollment,
  ClassGroup,
  ClassSchedule,
  Classroom,
  SchoolYear,
  Semester,
} from './types';

export { loadTeachersForSchool } from '~/lib/kinder/staff/load-staff';

export const loadSchoolYears = cache(async (schoolId: string) => {
  const client = getSupabaseServerClient();

  const { data, error } = await client
    .from('school_years')
    .select('*')
    .eq('school_id', schoolId)
    .order('start_date', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as SchoolYear[];
});

export const loadSemesters = cache(
  async (schoolId: string, schoolYearId: string) => {
    const client = getSupabaseServerClient();

    const { data, error } = await client
      .from('semesters')
      .select('*')
      .eq('school_id', schoolId)
      .eq('school_year_id', schoolYearId)
      .order('sort_order');

    if (error) {
      throw error;
    }

    return (data ?? []) as Semester[];
  },
);

export const loadClassrooms = cache(async (schoolId: string) => {
  const client = getSupabaseServerClient();

  const { data, error } = await client
    .from('classrooms')
    .select('*')
    .eq('school_id', schoolId)
    .order('name');

  if (error) {
    throw error;
  }

  return (data ?? []) as Classroom[];
});

export const loadClasses = cache(
  async (schoolId: string, schoolYearId?: string) => {
    const client = getSupabaseServerClient();

    let query = client
      .from('classes')
      .select(
        `
        *,
        school_year:school_years (id, name),
        semester:semesters (id, name),
        classroom:classrooms (id, name)
      `,
      )
      .eq('school_id', schoolId)
      .is('deleted_at', null)
      .eq('status', 'active')
      .order('name');

    if (schoolYearId) {
      query = query.eq('school_year_id', schoolYearId);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    const classes = (data ?? []) as ClassGroup[];

    const withCounts = await Promise.all(
      classes.map(async (cls) => {
        const { count } = await client
          .from('class_enrollments')
          .select('id', { count: 'exact', head: true })
          .eq('class_id', cls.id)
          .eq('status', 'active');

        return { ...cls, enrollment_count: count ?? 0 };
      }),
    );

    return withCounts;
  },
);

export const loadClassById = cache(
  async (schoolId: string, classId: string) => {
    const client = getSupabaseServerClient();

    const { data, error } = await client
      .from('classes')
      .select(
        `
        *,
        school_year:school_years (id, name),
        semester:semesters (id, name),
        classroom:classrooms (id, name, capacity)
      `,
      )
      .eq('school_id', schoolId)
      .eq('id', classId)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data as ClassGroup | null;
  },
);

export const loadClassEnrollments = cache(
  async (schoolId: string, classId: string) => {
    const client = getSupabaseServerClient();

    const { data, error } = await client
      .from('class_enrollments')
      .select(
        `
        *,
        student:students (id, full_name, student_code)
      `,
      )
      .eq('school_id', schoolId)
      .eq('class_id', classId)
      .eq('status', 'active')
      .order('enrolled_at', { ascending: false });

    if (error) {
      throw error;
    }

    return (data ?? []) as ClassEnrollment[];
  },
);

export const loadClassSchedules = cache(
  async (schoolId: string, classId: string) => {
    const client = getSupabaseServerClient();

    const { data, error } = await client
      .from('class_schedules')
      .select('*')
      .eq('school_id', schoolId)
      .eq('class_id', classId)
      .order('day_of_week')
      .order('start_time');

    if (error) {
      throw error;
    }

    return (data ?? []) as ClassSchedule[];
  },
);

export const loadUnassignedStudents = cache(async (schoolId: string) => {
  const client = getSupabaseServerClient();

  const { data, error } = await client
    .from('students')
    .select('id, full_name, student_code')
    .eq('school_id', schoolId)
    .is('deleted_at', null)
    .eq('status', 'active')
    .is('current_class_id', null)
    .order('full_name');

  if (error) {
    throw error;
  }

  return data ?? [];
});
