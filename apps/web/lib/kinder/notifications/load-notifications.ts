import 'server-only';

import { cache } from 'react';

import { getSupabaseServerClient } from '@kit/supabase/server-client';

import type { NotificationCategory, UserNotification } from './types';

export const loadUserNotifications = cache(async (userId: string, limit = 30) => {
  const client = getSupabaseServerClient();

  const { data, error } = await client
    .from('user_notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return (data ?? []) as UserNotification[];
});

export const loadUnreadNotificationCount = cache(async (userId: string) => {
  const client = getSupabaseServerClient();

  const { count, error } = await client
    .from('user_notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .is('read_at', null);

  if (error) {
    throw error;
  }

  return count ?? 0;
});

export async function createUserNotification(input: {
  schoolId: string;
  userId: string;
  category: NotificationCategory;
  title: string;
  body?: string;
  linkUrl?: string;
  referenceType?: string;
  referenceId?: string;
}) {
  const client = getSupabaseServerClient();

  const { error } = await client.from('user_notifications').insert({
    school_id: input.schoolId,
    user_id: input.userId,
    category: input.category,
    title: input.title,
    body: input.body ?? null,
    link_url: input.linkUrl ?? null,
    reference_type: input.referenceType ?? null,
    reference_id: input.referenceId ?? null,
  });

  if (error) {
    throw error;
  }
}

export async function notifyParentsOfDailyReport(input: {
  schoolId: string;
  studentId: string;
  studentName: string;
  reportDate: string;
  reportId: string;
}) {
  const client = getSupabaseServerClient();

  const { data: links, error } = await client
    .from('parent_student_links')
    .select('user_id')
    .eq('school_id', input.schoolId)
    .eq('student_id', input.studentId);

  if (error) {
    throw error;
  }

  const linkUrl = `/parent/children/${input.studentId}`;

  await Promise.all(
    (links ?? []).map((link) =>
      createUserNotification({
        schoolId: input.schoolId,
        userId: link.user_id,
        category: 'daily_report',
        title: `Nhật ký mới: ${input.studentName}`,
        body: `Nhật ký ngày ${input.reportDate} đã được cập nhật.`,
        linkUrl,
        referenceType: 'daily_report',
        referenceId: input.reportId,
      }),
    ),
  );
}
