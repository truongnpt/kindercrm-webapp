import 'server-only';

import pathsConfig from '~/config/paths.config';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import { createUserNotification } from '../notifications/load-notifications';
import { loadSchoolStaffUserIds } from '../notifications/staff-notifications';

import type { CommunicationChannel, CommunicationThread } from './types';

async function loadParentUserIdsForStudent(schoolId: string, studentId: string) {
  const client = getSupabaseServerClient();

  const { data, error } = await client
    .from('parent_student_links')
    .select('user_id')
    .eq('school_id', schoolId)
    .eq('student_id', studentId);

  if (error) {
    throw error;
  }

  return [...new Set((data ?? []).map((row) => row.user_id))];
}

async function loadHomeroomTeacherUserId(schoolId: string, classId: string | null) {
  if (!classId) {
    return null;
  }

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

function channelLabel(channel: CommunicationChannel) {
  return channel === 'homeroom' ? 'GVCN' : 'Nhà trường';
}

export async function notifyCommunicationMessageRecipients(input: {
  thread: CommunicationThread;
  studentName: string;
  senderUserId: string;
  senderType: 'parent' | 'staff';
  messagePreview: string;
  messageId: string;
}) {
  const userIds = new Set<string>();

  if (input.senderType === 'parent') {
    if (input.thread.channel === 'homeroom') {
      const teacherUserId = await loadHomeroomTeacherUserId(
        input.thread.school_id,
        input.thread.class_id,
      );

      if (teacherUserId) {
        userIds.add(teacherUserId);
      }
    } else {
      const staffUserIds = await loadSchoolStaffUserIds(input.thread.school_id);

      for (const userId of staffUserIds) {
        userIds.add(userId);
      }
    }
  } else {
    const parentUserIds = await loadParentUserIdsForStudent(
      input.thread.school_id,
      input.thread.student_id,
    );

    for (const userId of parentUserIds) {
      if (userId !== input.senderUserId) {
        userIds.add(userId);
      }
    }
  }

  userIds.delete(input.senderUserId);

  const linkUrl =
    input.senderType === 'parent'
      ? `${pathsConfig.app.messages}?threadId=${input.thread.id}`
      : `${pathsConfig.parent.messages}?threadId=${input.thread.id}`;

  await Promise.all(
    [...userIds].map((userId) =>
      createUserNotification({
        schoolId: input.thread.school_id,
        userId,
        category: 'communication',
        title: `Tin nhắn mới (${channelLabel(input.thread.channel)}): ${input.studentName}`,
        body: input.messagePreview.slice(0, 200),
        linkUrl,
        referenceType: 'communication_message',
        referenceId: input.messageId,
      }),
    ),
  );
}
