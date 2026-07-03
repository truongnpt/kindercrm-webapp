import 'server-only';

import pathsConfig from '~/config/paths.config';
import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import { createUserNotification } from '../notifications/load-notifications';
import { loadSchoolStaffUserIds } from '../notifications/staff-notifications';

import type { SchoolCalendarEvent } from './types';

function toDateKey(iso: string) {
  return iso.slice(0, 10);
}

function formatEventRange(event: SchoolCalendarEvent) {
  const start = toDateKey(event.starts_at);
  const end = toDateKey(event.ends_at);

  if (end !== start) {
    return `${start} → ${end}`;
  }

  return start;
}

async function loadParentUserIdsForClass(schoolId: string, classId: string) {
  const client = getSupabaseServerClient();

  const { data: enrollments, error: enrollmentError } = await client
    .from('class_enrollments')
    .select('student_id')
    .eq('school_id', schoolId)
    .eq('class_id', classId)
    .eq('status', 'active');

  if (enrollmentError) {
    throw enrollmentError;
  }

  const studentIds = [...new Set((enrollments ?? []).map((row) => row.student_id))];

  if (studentIds.length === 0) {
    return [];
  }

  const { data: links, error: linkError } = await client
    .from('parent_student_links')
    .select('user_id')
    .eq('school_id', schoolId)
    .in('student_id', studentIds);

  if (linkError) {
    throw linkError;
  }

  return [...new Set((links ?? []).map((row) => row.user_id))];
}

async function loadHomeroomTeacherUserId(schoolId: string, classId: string) {
  const client = getSupabaseServerClient();

  const { data, error } = await client
    .from('classes')
    .select('teacher_user_id')
    .eq('school_id', schoolId)
    .eq('id', classId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data?.teacher_user_id ?? null;
}

async function hasUnreadNotification(input: {
  schoolId: string;
  userId: string;
  referenceType: string;
  referenceId: string;
}) {
  const client = getSupabaseServerAdminClient();

  const { count, error } = await client
    .from('user_notifications')
    .select('id', { count: 'exact', head: true })
    .eq('school_id', input.schoolId)
    .eq('user_id', input.userId)
    .eq('category', 'calendar')
    .eq('reference_type', input.referenceType)
    .eq('reference_id', input.referenceId)
    .is('read_at', null);

  if (error) {
    throw error;
  }

  return (count ?? 0) > 0;
}

async function notifyUsers(input: {
  schoolId: string;
  userIds: string[];
  title: string;
  body?: string;
  linkUrl?: string;
  referenceType: string;
  referenceId: string;
  skipDuplicate?: boolean;
}) {
  const uniqueUserIds = [...new Set(input.userIds)].filter(Boolean);

  await Promise.all(
    uniqueUserIds.map(async (userId) => {
      if (input.skipDuplicate) {
        const exists = await hasUnreadNotification({
          schoolId: input.schoolId,
          userId,
          referenceType: input.referenceType,
          referenceId: input.referenceId,
        });

        if (exists) {
          return;
        }
      }

      await createUserNotification({
        schoolId: input.schoolId,
        userId,
        category: 'calendar',
        title: input.title,
        body: input.body,
        linkUrl: input.linkUrl,
        referenceType: input.referenceType,
        referenceId: input.referenceId,
      });
    }),
  );
}

export async function resolveCalendarEventAudienceUserIds(
  schoolId: string,
  event: Pick<SchoolCalendarEvent, 'scope_type' | 'class_id' | 'campus_id'>,
) {
  const staffUserIds = await loadSchoolStaffUserIds(schoolId);
  const userIds = new Set<string>(staffUserIds);

  if (event.scope_type === 'class' && event.class_id) {
    const [parentUserIds, teacherUserId] = await Promise.all([
      loadParentUserIdsForClass(schoolId, event.class_id),
      loadHomeroomTeacherUserId(schoolId, event.class_id),
    ]);

    for (const userId of parentUserIds) {
      userIds.add(userId);
    }

    if (teacherUserId) {
      userIds.add(teacherUserId);
    }
  }

  return [...userIds];
}

export async function notifyCalendarEventCreated(event: SchoolCalendarEvent) {
  if (!event.notify_on_create) {
    return;
  }

  const userIds = await resolveCalendarEventAudienceUserIds(event.school_id, event);
  const linkUrl = `${pathsConfig.app.calendar}?date=${toDateKey(event.starts_at)}`;

  await notifyUsers({
    schoolId: event.school_id,
    userIds,
    title: `Sự kiện mới: ${event.title}`,
    body: formatEventRange(event),
    linkUrl,
    referenceType: 'calendar_event_created',
    referenceId: event.id,
    skipDuplicate: true,
  });
}

export async function processDueCalendarReminders(schoolId: string) {
  const client = getSupabaseServerClient();
  const today = new Date();
  const horizon = new Date(today);
  horizon.setDate(horizon.getDate() + 7);
  const horizonIso = horizon.toISOString();

  const { data, error } = await client
    .from('calendar_events')
    .select('*')
    .eq('school_id', schoolId)
    .is('deleted_at', null)
    .not('remind_days_before', 'is', null)
    .gte('starts_at', today.toISOString())
    .lte('starts_at', horizonIso);

  if (error) {
    throw error;
  }

  const events = (data ?? []) as SchoolCalendarEvent[];

  for (const event of events) {
    const remindDays = event.remind_days_before ?? 0;
    const startsAt = new Date(event.starts_at);
    const remindAt = new Date(startsAt);
    remindAt.setDate(remindAt.getDate() - remindDays);

    const remindDateKey = remindAt.toISOString().slice(0, 10);
    const todayKey = today.toISOString().slice(0, 10);

    if (remindDateKey !== todayKey) {
      continue;
    }

    const userIds = await resolveCalendarEventAudienceUserIds(
      schoolId,
      event,
    );
    const linkUrl = `${pathsConfig.app.calendar}?date=${toDateKey(event.starts_at)}`;

    await notifyUsers({
      schoolId,
      userIds,
      title: `Nhắc lịch: ${event.title}`,
      body: `Sự kiện diễn ra ngày ${toDateKey(event.starts_at)}.`,
      linkUrl,
      referenceType: 'calendar_event_reminder',
      referenceId: event.id,
      skipDuplicate: true,
    });
  }
}
