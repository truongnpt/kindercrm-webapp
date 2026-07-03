import 'server-only';

import { cache } from 'react';

import { getSupabaseServerClient } from '@kit/supabase/server-client';

import { KINDER_ERROR_CODES, KinderError } from '../errors';
import { assertParentStudentAccess, loadParentLinksForUser } from '../parent/load-parent';
import { requireSchoolContext } from '../tenant/get-school-context';

import type {
  CommunicationChannel,
  CommunicationMessage,
  CommunicationMessageReaction,
  CommunicationMessageWithSender,
  CommunicationThread,
  CommunicationThreadSummary,
} from './types';
import { COMMUNICATION_CHANNELS } from './types';
import { groupReactionsByMessageId } from './group-message-reactions';
import { buildSenderProfileMap } from './load-sender-profiles';
import { mergeReplyPreviews, toReplyPreview } from './message-reply';

async function loadSenderProfiles(userIds: string[]) {
  const uniqueIds = [...new Set(userIds)].filter(Boolean);

  if (uniqueIds.length === 0) {
    return new Map<string, { name: string; pictureUrl: string | null }>();
  }

  const client = getSupabaseServerClient();

  const { data: accounts, error: accountError } = await client
    .from('accounts')
    .select('id, name, picture_url')
    .in('id', uniqueIds);

  if (accountError) {
    throw accountError;
  }

  const { data: staff, error: staffError } = await client
    .from('staff_employees')
    .select('user_id, full_name')
    .in('user_id', uniqueIds)
    .is('deleted_at', null);

  if (staffError) {
    throw staffError;
  }

  return buildSenderProfileMap(uniqueIds, accounts ?? [], staff ?? []);
}

async function attachUnreadCounts(
  threads: CommunicationThread[],
  userId: string,
): Promise<CommunicationThreadSummary[]> {
  if (threads.length === 0) {
    return [];
  }

  const client = getSupabaseServerClient();
  const threadIds = threads.map((thread) => thread.id);

  const [{ data: reads }, { data: messages }] = await Promise.all([
    client
      .from('communication_thread_reads')
      .select('thread_id, last_read_at')
      .eq('user_id', userId)
      .in('thread_id', threadIds),
    client
      .from('communication_messages')
      .select('thread_id, created_at, sender_user_id')
      .in('thread_id', threadIds)
      .order('created_at', { ascending: false }),
  ]);

  const readMap = new Map(
    (reads ?? []).map((row) => [row.thread_id, row.last_read_at]),
  );

  const unreadByThread = new Map<string, number>();

  for (const threadId of threadIds) {
    const lastReadAt = readMap.get(threadId);
    const unread = (messages ?? []).filter(
      (message) =>
        message.thread_id === threadId &&
        message.sender_user_id !== userId &&
        (!lastReadAt || message.created_at > lastReadAt),
    ).length;

    unreadByThread.set(threadId, unread);
  }

  const studentIds = [...new Set(threads.map((thread) => thread.student_id))];
  const schoolIds = [...new Set(threads.map((thread) => thread.school_id))];

  const [{ data: students }, { data: schools }] = await Promise.all([
    client
      .from('students')
      .select('id, full_name, student_code, photo_url')
      .in('id', studentIds),
    client.from('schools').select('id, name').in('id', schoolIds),
  ]);

  const studentMap = new Map(
    (students ?? []).map((student) => [student.id, student]),
  );
  const schoolMap = new Map((schools ?? []).map((school) => [school.id, school]));

  return threads.map((thread) => {
    const student = studentMap.get(thread.student_id);
    const school = schoolMap.get(thread.school_id);

    return {
      ...thread,
      studentName: student?.full_name ?? '—',
      studentCode: student?.student_code ?? '',
      studentPhotoUrl: student?.photo_url ?? null,
      schoolName: school?.name ?? '',
      unreadCount: unreadByThread.get(thread.id) ?? 0,
    };
  });
}

export async function ensureCommunicationThreads(
  schoolId: string,
  studentId: string,
) {
  const client = getSupabaseServerClient();

  const { data: student, error: studentError } = await client
    .from('students')
    .select('id, current_class_id')
    .eq('id', studentId)
    .eq('school_id', schoolId)
    .is('deleted_at', null)
    .single();

  if (studentError || !student) {
    throw new KinderError(
      KINDER_ERROR_CODES.STUDENT_NOT_FOUND,
      'Student not found',
    );
  }

  for (const channel of COMMUNICATION_CHANNELS) {
    const classId = channel === 'homeroom' ? student.current_class_id : null;

    const { error } = await client.from('communication_threads').upsert(
      {
        school_id: schoolId,
        student_id: studentId,
        channel,
        class_id: classId,
      },
      { onConflict: 'school_id,student_id,channel' },
    );

    if (error) {
      throw error;
    }
  }
}

export const loadParentCommunicationThreads = cache(
  async (userId: string, options?: { schoolId?: string; studentId?: string }) => {
    const links = await loadParentLinksForUser(userId);
    const filteredLinks = links.filter((link) => {
      if (options?.schoolId && link.schoolId !== options.schoolId) {
        return false;
      }

      if (options?.studentId && link.studentId !== options.studentId) {
        return false;
      }

      return true;
    });

    if (filteredLinks.length === 0) {
      return [] as CommunicationThreadSummary[];
    }

    await Promise.all(
      filteredLinks.map((link) =>
        ensureCommunicationThreads(link.schoolId, link.studentId),
      ),
    );

    const client = getSupabaseServerClient();
    const studentIds = [...new Set(filteredLinks.map((link) => link.studentId))];

    const { data, error } = await client
      .from('communication_threads')
      .select('*')
      .in('student_id', studentIds)
      .order('last_message_at', { ascending: false, nullsFirst: false });

    if (error) {
      throw error;
    }

    const allowedSchoolIds = new Set(filteredLinks.map((link) => link.schoolId));
    const threads = ((data ?? []) as CommunicationThread[]).filter((thread) =>
      allowedSchoolIds.has(thread.school_id),
    );

    return attachUnreadCounts(threads, userId);
  },
);

export const loadStaffCommunicationThreads = cache(
  async (
    schoolId: string,
    userId: string,
    role: string,
  ) => {
    const client = getSupabaseServerClient();

    let query = client
      .from('communication_threads')
      .select('*')
      .eq('school_id', schoolId)
      .order('last_message_at', { ascending: false, nullsFirst: false });

    if (role === 'teacher') {
      const { data: classes, error: classError } = await client
        .from('classes')
        .select('id')
        .eq('school_id', schoolId)
        .eq('teacher_user_id', userId);

      if (classError) {
        throw classError;
      }

      const classIds = (classes ?? []).map((cls) => cls.id);

      if (classIds.length === 0) {
        query = query.eq('channel', 'school_office');
      } else {
        query = query.or(
          `channel.eq.school_office,and(channel.eq.homeroom,class_id.in.(${classIds.join(',')}))`,
        );
      }
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return attachUnreadCounts((data ?? []) as CommunicationThread[], userId);
  },
);

export const loadCommunicationMessages = cache(
  async (
    schoolId: string,
    threadId: string,
    userId: string,
    limit = 100,
  ) => {
    const client = getSupabaseServerClient();

    const { data, error } = await client
      .from('communication_messages')
      .select('*')
      .eq('school_id', schoolId)
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) {
      throw error;
    }

    const messages = (data ?? []) as CommunicationMessage[];
    const messageIds = messages.map((message) => message.id);
    const replyIds = [
      ...new Set(
        messages
          .map((message) => message.reply_to_message_id)
          .filter((id): id is string => Boolean(id)),
      ),
    ];
    const missingReplyIds = replyIds.filter(
      (id) => !messages.some((message) => message.id === id),
    );

    const [{ data: reactionRows }, { data: replyRows }] = await Promise.all([
      messageIds.length > 0
        ? client
            .from('communication_message_reactions')
            .select('*')
            .in('message_id', messageIds)
        : Promise.resolve({ data: [] as CommunicationMessageReaction[] }),
      missingReplyIds.length > 0
        ? client
            .from('communication_messages')
            .select('*')
            .in('id', missingReplyIds)
        : Promise.resolve({ data: [] as CommunicationMessage[] }),
    ]);

    const senderMap = await loadSenderProfiles([
      ...messages.map((message) => message.sender_user_id),
      ...(replyRows ?? []).map((message) => message.sender_user_id),
    ]);

    const reactionsByMessage = groupReactionsByMessageId(
      (reactionRows ?? []) as CommunicationMessageReaction[],
      userId,
    );

    const replyTargets = new Map(
      (replyRows ?? []).map((message) => {
        const sender = senderMap.get(message.sender_user_id);

        return [
          message.id,
          {
            ...message,
            senderName: sender?.name ?? '—',
            senderPictureUrl: sender?.pictureUrl ?? null,
          },
        ];
      }),
    );

    const withSenders = messages.map((message) => {
      const sender = senderMap.get(message.sender_user_id);

      return {
        ...message,
        senderName: sender?.name ?? '—',
        senderPictureUrl: sender?.pictureUrl ?? null,
        reactions: reactionsByMessage.get(message.id) ?? [],
      };
    });

    return mergeReplyPreviews(withSenders, replyTargets);
  },
);

export async function assertParentThreadAccess(
  userId: string,
  schoolId: string,
  threadId: string,
) {
  const client = getSupabaseServerClient();

  const { data: thread, error } = await client
    .from('communication_threads')
    .select('*')
    .eq('id', threadId)
    .eq('school_id', schoolId)
    .single();

  if (error || !thread) {
    throw new KinderError(
      KINDER_ERROR_CODES.PARENT_ACCESS_DENIED,
      'Conversation not found',
    );
  }

  await assertParentStudentAccess(userId, thread.student_id);

  return thread as CommunicationThread;
}

export async function assertStaffThreadAccess(
  schoolId: string,
  threadId: string,
  userId: string,
  role: string,
) {
  const client = getSupabaseServerClient();

  const { data: thread, error } = await client
    .from('communication_threads')
    .select('*')
    .eq('id', threadId)
    .eq('school_id', schoolId)
    .single();

  if (error || !thread) {
    throw new KinderError(
      KINDER_ERROR_CODES.PARENT_ACCESS_DENIED,
      'Conversation not found',
    );
  }

  if (
    role === 'teacher' &&
    thread.channel === 'homeroom' &&
    thread.class_id
  ) {
    const { data: cls, error: classError } = await client
      .from('classes')
      .select('teacher_user_id')
      .eq('id', thread.class_id)
      .maybeSingle();

    if (classError) {
      throw classError;
    }

    if (cls?.teacher_user_id !== userId) {
      throw new KinderError(
        KINDER_ERROR_CODES.PERMISSION_DENIED,
        'You can only reply to your homeroom class conversations',
      );
    }
  }

  return thread as CommunicationThread;
}

export async function openCommunicationThread(input: {
  schoolId: string;
  studentId: string;
  channel: CommunicationChannel;
}) {
  await ensureCommunicationThreads(input.schoolId, input.studentId);

  const client = getSupabaseServerClient();

  const { data, error } = await client
    .from('communication_threads')
    .select('*')
    .eq('school_id', input.schoolId)
    .eq('student_id', input.studentId)
    .eq('channel', input.channel)
    .single();

  if (error || !data) {
    throw error ?? new Error('Failed to open conversation');
  }

  return data as CommunicationThread;
}

export async function assertCommunicationMessageAccess(
  userId: string,
  schoolId: string,
  threadId: string,
  messageId: string,
) {
  const client = getSupabaseServerClient();

  const { data: message, error } = await client
    .from('communication_messages')
    .select('id, school_id, thread_id')
    .eq('id', messageId)
    .eq('school_id', schoolId)
    .eq('thread_id', threadId)
    .single();

  if (error || !message) {
    throw new KinderError(
      KINDER_ERROR_CODES.PARENT_ACCESS_DENIED,
      'Message not found',
    );
  }

  const staffMembership = await client
    .from('school_members')
    .select('role')
    .eq('user_id', userId)
    .eq('school_id', schoolId)
    .neq('role', 'parent')
    .maybeSingle();

  if (staffMembership.data) {
    const context = await requireSchoolContext(userId);

    await assertStaffThreadAccess(
      schoolId,
      threadId,
      userId,
      context.role,
    );

    return message;
  }

  await assertParentThreadAccess(userId, schoolId, threadId);

  return message;
}
