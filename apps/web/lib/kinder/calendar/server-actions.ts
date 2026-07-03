'use server';

import { revalidatePath } from 'next/cache';

import { enhanceAction } from '@kit/next/actions';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import pathsConfig from '~/config/paths.config';
import { KINDER_ERROR_CODES, KinderError } from '~/lib/kinder/errors';
import { CALENDAR_PERMISSIONS } from '~/lib/kinder/permissions/permission-keys';
import { assertPermissionFromContext } from '~/lib/kinder/permissions/assert-permission.server';
import { requireSchoolContext } from '~/lib/kinder/tenant/get-school-context';

import {
  notifyCalendarEventCreated,
} from './calendar-notifications';
import {
  CreateCalendarEventSchema,
  DeleteCalendarEventSchema,
  UpdateCalendarEventSchema,
} from './schemas/calendar.schema';
import type { SchoolCalendarEvent } from './types';

const CALENDAR_PATH = pathsConfig.app.calendar;

function revalidateCalendarPaths() {
  revalidatePath(CALENDAR_PATH);
  revalidatePath(pathsConfig.app.home);
  revalidatePath(pathsConfig.parent.calendar);
}

function assertSchoolMatch(schoolId: string, contextSchoolId: string) {
  if (schoolId !== contextSchoolId) {
    throw new KinderError(
      KINDER_ERROR_CODES.SCHOOL_ACCESS_DENIED,
      'School mismatch',
    );
  }
}

function buildTimestamps(data: {
  startDate: string;
  endDate: string;
  allDay: boolean;
  startTime?: string;
  endTime?: string;
}) {
  if (data.allDay) {
    return {
      starts_at: `${data.startDate}T00:00:00.000Z`,
      ends_at: `${data.endDate}T23:59:59.999Z`,
      all_day: true,
    };
  }

  const startTime = data.startTime || '08:00';
  const endTime = data.endTime || '17:00';

  return {
    starts_at: `${data.startDate}T${startTime}:00.000Z`,
    ends_at: `${data.endDate}T${endTime}:00.000Z`,
    all_day: false,
  };
}

function normalizeScopeFields(data: {
  scopeType: SchoolCalendarEvent['scope_type'];
  campusId?: string;
  classId?: string;
}) {
  return {
    scope_type: data.scopeType,
    campus_id: data.scopeType === 'campus' ? data.campusId || null : null,
    class_id: data.scopeType === 'class' ? data.classId || null : null,
  };
}

async function assertTeacherCanManageScope(
  schoolId: string,
  userId: string,
  role: string,
  scopeType: SchoolCalendarEvent['scope_type'],
  classId?: string | null,
) {
  if (role !== 'teacher') {
    return;
  }

  if (scopeType !== 'class' || !classId) {
    throw new KinderError(
      KINDER_ERROR_CODES.PERMISSION_DENIED,
      'Teachers can only create class-scoped events',
    );
  }

  const client = getSupabaseServerClient();

  const { data, error } = await client
    .from('classes')
    .select('id')
    .eq('school_id', schoolId)
    .eq('id', classId)
    .eq('teacher_user_id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new KinderError(
      KINDER_ERROR_CODES.PERMISSION_DENIED,
      'You can only manage events for your homeroom class',
    );
  }
}

export const createCalendarEventAction = enhanceAction(
  async (data, user) => {
    const context = await requireSchoolContext(user.id);

    assertSchoolMatch(data.schoolId, context.school.id);
    await assertPermissionFromContext(
      context,
      CALENDAR_PERMISSIONS.EVENTS_MANAGE,
    );

    const scope = normalizeScopeFields(data);

    await assertTeacherCanManageScope(
      data.schoolId,
      user.id,
      context.role,
      data.scopeType,
      scope.class_id,
    );

    const client = getSupabaseServerClient();
    const timestamps = buildTimestamps(data);

    const { data: event, error } = await client
      .from('calendar_events')
      .insert({
        school_id: data.schoolId,
        title: data.title.trim(),
        description: data.description?.trim() || null,
        category: data.category,
        ...scope,
        ...timestamps,
        remind_days_before: data.remindDaysBefore ?? null,
        notify_on_create: data.notifyOnCreate ?? true,
        created_by: user.id,
      })
      .select('*')
      .single();

    if (error || !event) {
      throw error ?? new Error('Failed to create calendar event');
    }

    try {
      await notifyCalendarEventCreated(event as SchoolCalendarEvent);
    } catch (notifyError) {
      console.error('Failed to notify calendar event audience', notifyError);
    }

    revalidateCalendarPaths();

    return { success: true, eventId: event.id };
  },
  { schema: CreateCalendarEventSchema },
);

export const updateCalendarEventAction = enhanceAction(
  async (data, user) => {
    const context = await requireSchoolContext(user.id);

    assertSchoolMatch(data.schoolId, context.school.id);
    await assertPermissionFromContext(
      context,
      CALENDAR_PERMISSIONS.EVENTS_MANAGE,
    );

    const scope = normalizeScopeFields(data);

    await assertTeacherCanManageScope(
      data.schoolId,
      user.id,
      context.role,
      data.scopeType,
      scope.class_id,
    );

    const client = getSupabaseServerClient();
    const timestamps = buildTimestamps(data);

    const { error } = await client
      .from('calendar_events')
      .update({
        title: data.title.trim(),
        description: data.description?.trim() || null,
        category: data.category,
        ...scope,
        ...timestamps,
        remind_days_before: data.remindDaysBefore ?? null,
        notify_on_create: data.notifyOnCreate ?? true,
      })
      .eq('id', data.eventId)
      .eq('school_id', data.schoolId)
      .is('deleted_at', null);

    if (error) {
      throw error;
    }

    revalidateCalendarPaths();

    return { success: true };
  },
  { schema: UpdateCalendarEventSchema },
);

export const deleteCalendarEventAction = enhanceAction(
  async (data, user) => {
    const context = await requireSchoolContext(user.id);

    assertSchoolMatch(data.schoolId, context.school.id);
    await assertPermissionFromContext(
      context,
      CALENDAR_PERMISSIONS.EVENTS_MANAGE,
    );

    const client = getSupabaseServerClient();

    const { error } = await client
      .from('calendar_events')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', data.eventId)
      .eq('school_id', data.schoolId)
      .is('deleted_at', null);

    if (error) {
      throw error;
    }

    revalidateCalendarPaths();

    return { success: true };
  },
  { schema: DeleteCalendarEventSchema },
);
