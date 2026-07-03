import 'server-only';

import { cache } from 'react';

import { getSupabaseServerClient } from '@kit/supabase/server-client';

import type { SchoolCalendarEvent } from '~/lib/kinder/calendar/types';

import { KINDER_ERROR_CODES, KinderError } from '../errors';
import { assertParentStudentAccess, loadParentLinksForUser } from './load-parent';
import type { ParentChildSummary } from './types';

function monthBounds(month: string) {
  const start = `${month}-01`;
  const endDate = new Date(`${month}-01T00:00:00`);

  endDate.setMonth(endDate.getMonth() + 1);
  endDate.setDate(0);

  return {
    start,
    end: endDate.toISOString().slice(0, 10),
  };
}

function eventVisibleForStudent(
  event: SchoolCalendarEvent,
  classId: string | null,
  campusId: string | null,
) {
  if (event.scope_type === 'school') {
    return true;
  }

  if (event.scope_type === 'class') {
    return classId !== null && event.class_id === classId;
  }

  if (event.scope_type === 'campus') {
    return campusId !== null && event.campus_id === campusId;
  }

  return false;
}

export const loadParentCalendarSchools = cache(async (userId: string) => {
  const links = await loadParentLinksForUser(userId);
  const bySchool = new Map<string, { schoolId: string; schoolName: string }>();

  for (const link of links) {
    bySchool.set(link.schoolId, {
      schoolId: link.schoolId,
      schoolName: link.schoolName,
    });
  }

  return [...bySchool.values()];
});

export const loadParentChildrenForSchool = cache(
  async (userId: string, schoolId: string) => {
    const links = await loadParentLinksForUser(userId);

    return links.filter((link) => link.schoolId === schoolId);
  },
);

export const loadParentCalendarEvents = cache(
  async (options: {
    userId: string;
    schoolId: string;
    month?: string;
    studentId?: string;
  }) => {
    const { userId, schoolId, month, studentId } = options;
    const links = await loadParentLinksForUser(userId);

    if (!links.some((link) => link.schoolId === schoolId)) {
      throw new KinderError(
        KINDER_ERROR_CODES.PARENT_ACCESS_DENIED,
        'You do not have access to this school calendar',
      );
    }

    const client = getSupabaseServerClient();

    let query = client
      .from('calendar_events')
      .select('*')
      .eq('school_id', schoolId)
      .is('deleted_at', null)
      .order('starts_at', { ascending: true });

    if (month) {
      const { start, end } = monthBounds(month);

      query = query
        .lte('starts_at', `${end}T23:59:59.999Z`)
        .gte('ends_at', `${start}T00:00:00.000Z`);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    let events = (data ?? []) as SchoolCalendarEvent[];

    if (studentId) {
      await assertParentStudentAccess(userId, studentId);

      const { data: student, error: studentError } = await client
        .from('students')
        .select('current_class_id')
        .eq('id', studentId)
        .eq('school_id', schoolId)
        .is('deleted_at', null)
        .single();

      if (studentError) {
        throw studentError;
      }

      let campusId: string | null = null;

      if (student.current_class_id) {
        const { data: cls, error: classError } = await client
          .from('classes')
          .select('campus_id')
          .eq('id', student.current_class_id)
          .maybeSingle();

        if (classError) {
          throw classError;
        }

        campusId = cls?.campus_id ?? null;
      }

      events = events.filter((event) =>
        eventVisibleForStudent(
          event,
          student.current_class_id,
          campusId,
        ),
      );
    }

    return events;
  },
);

export function resolveParentCalendarSchool(
  schools: { schoolId: string; schoolName: string }[],
  children: ParentChildSummary[],
  schoolId?: string,
) {
  if (schoolId && schools.some((school) => school.schoolId === schoolId)) {
    return schoolId;
  }

  const primary =
    children.find((child) => child.isPrimary) ?? children[0] ?? null;

  return primary?.schoolId ?? schools[0]?.schoolId ?? null;
}

export const loadParentUpcomingCalendarEvents = cache(
  async (userId: string, limit = 5) => {
    const schools = await loadParentCalendarSchools(userId);

    if (schools.length === 0) {
      return [];
    }

    const client = getSupabaseServerClient();
    const now = new Date().toISOString();
    const schoolIds = schools.map((school) => school.schoolId);
    const schoolNameById = new Map(
      schools.map((school) => [school.schoolId, school.schoolName]),
    );

    const { data, error } = await client
      .from('calendar_events')
      .select('*')
      .in('school_id', schoolIds)
      .is('deleted_at', null)
      .gte('ends_at', now)
      .order('starts_at', { ascending: true })
      .limit(limit);

    if (error) {
      throw error;
    }

    return ((data ?? []) as SchoolCalendarEvent[]).map((event) => ({
      event,
      schoolName: schoolNameById.get(event.school_id) ?? '',
    }));
  },
);
