import 'server-only';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import pathsConfig from '~/config/paths.config';
import type { Database } from '~/lib/database.types';

import { createUserNotification } from './load-notifications';
import type { NotificationCategory } from './types';

type SchoolMemberRole = Database['public']['Enums']['school_member_role'];

export async function loadSchoolStaffUserIds(schoolId: string) {
  const client = getSupabaseServerClient();

  const { data, error } = await client
    .from('school_members')
    .select('user_id')
    .eq('school_id', schoolId)
    .neq('role', 'parent' satisfies SchoolMemberRole);

  if (error) {
    throw error;
  }

  return [...new Set((data ?? []).map((row) => row.user_id))];
}

async function hasUnreadNotification(input: {
  schoolId: string;
  userId: string;
  category: NotificationCategory;
  referenceType: string;
  referenceId: string;
}) {
  const client = getSupabaseServerAdminClient();

  const { count, error } = await client
    .from('user_notifications')
    .select('id', { count: 'exact', head: true })
    .eq('school_id', input.schoolId)
    .eq('user_id', input.userId)
    .eq('category', input.category)
    .eq('reference_type', input.referenceType)
    .eq('reference_id', input.referenceId)
    .is('read_at', null);

  if (error) {
    throw error;
  }

  return (count ?? 0) > 0;
}

export async function notifyStaffUsers(input: {
  schoolId: string;
  userIds: string[];
  category: NotificationCategory;
  title: string;
  body?: string;
  linkUrl?: string;
  referenceType?: string;
  referenceId?: string;
  skipIfUnreadDuplicate?: boolean;
}) {
  const uniqueUserIds = [...new Set(input.userIds)].filter(Boolean);

  await Promise.all(
    uniqueUserIds.map(async (userId) => {
      if (
        input.skipIfUnreadDuplicate &&
        input.referenceType &&
        input.referenceId
      ) {
        const exists = await hasUnreadNotification({
          schoolId: input.schoolId,
          userId,
          category: input.category,
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
        category: input.category,
        title: input.title,
        body: input.body,
        linkUrl: input.linkUrl,
        referenceType: input.referenceType,
        referenceId: input.referenceId,
      });
    }),
  );
}

export async function notifyClassHomeroomTeacher(input: {
  schoolId: string;
  classId: string | null;
  category: NotificationCategory;
  title: string;
  body?: string;
  linkUrl?: string;
  referenceType?: string;
  referenceId?: string;
}) {
  if (!input.classId) {
    return;
  }

  const client = getSupabaseServerClient();

  const { data: cls, error } = await client
    .from('classes')
    .select('teacher_user_id')
    .eq('id', input.classId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!cls?.teacher_user_id) {
    return;
  }

  await notifyStaffUsers({
    schoolId: input.schoolId,
    userIds: [cls.teacher_user_id],
    category: input.category,
    title: input.title,
    body: input.body,
    linkUrl: input.linkUrl,
    referenceType: input.referenceType,
    referenceId: input.referenceId,
    skipIfUnreadDuplicate: true,
  });
}

export async function notifyStaffOfParentDailyReportAck(input: {
  schoolId: string;
  studentId: string;
  studentName: string;
  reportDate: string;
  reportId: string;
  classId: string | null;
}) {
  const linkUrl = `${pathsConfig.parent.child}/${input.studentId}`;

  await notifyClassHomeroomTeacher({
    schoolId: input.schoolId,
    classId: input.classId,
    category: 'daily_report',
    title: `Phụ huynh đã xác nhận nhật ký: ${input.studentName}`,
    body: `Nhật ký ngày ${input.reportDate} đã được phụ huynh xác nhận.`,
    linkUrl,
    referenceType: 'daily_report_ack',
    referenceId: input.reportId,
  });
}

export async function notifyStaffOfIncompleteDailyReports(input: {
  schoolId: string;
  reportDate: string;
  classes: Array<{
    classId: string;
    className: string;
    missingCount: number;
    draftCount: number;
  }>;
}) {
  const incomplete = input.classes.filter(
    (cls) => cls.missingCount > 0 || cls.draftCount > 0,
  );

  if (incomplete.length === 0) {
    return { notified: 0 };
  }

  const linkUrl = `${pathsConfig.app.dailyReports}?date=${input.reportDate}&tab=overview`;
  let notified = 0;

  for (const cls of incomplete) {
    const pending = cls.missingCount + cls.draftCount;

    await notifyClassHomeroomTeacher({
      schoolId: input.schoolId,
      classId: cls.classId,
      category: 'daily_report',
      title: `Nhắc nhật ký lớp ${cls.className}`,
      body: `Còn ${pending} học sinh chưa gửi nhật ký ngày ${input.reportDate}.`,
      linkUrl: `${pathsConfig.app.dailyReports}?date=${input.reportDate}&tab=class&classId=${cls.classId}`,
      referenceType: 'daily_report_reminder',
      referenceId: `${cls.classId}:${input.reportDate}`,
    });

    notified += 1;
  }

  return { notified };
}
