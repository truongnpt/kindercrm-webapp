'use server';

import { revalidatePath } from 'next/cache';

import { enhanceAction } from '@kit/next/actions';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import pathsConfig from '~/config/paths.config';
import { KINDER_ERROR_CODES, KinderError } from '~/lib/kinder/errors';
import { assertPermissionFromContext } from '~/lib/kinder/permissions/assert-permission.server';
import { COMMUNICATION_PERMISSIONS } from '~/lib/kinder/permissions/permission-keys';
import { requireSchoolContext } from '~/lib/kinder/tenant/get-school-context';

import { notifyCommunicationMessageRecipients } from './communication-notifications';
import {
  assertCommunicationMediaStoragePath,
  buildCommunicationMessagePreview,
  isCommunicationImageMimeType,
} from './storage';
import {
  assertCommunicationMessageAccess,
  assertParentThreadAccess,
  assertStaffThreadAccess,
  openCommunicationThread,
} from './load-communication';
import {
  MarkCommunicationThreadReadSchema,
  OpenCommunicationThreadSchema,
  SendCommunicationMessageSchema,
  ToggleCommunicationReactionSchema,
} from './schemas/communication.schema';
import type { CommunicationSenderType } from './types';

const MESSAGES_PATHS = [pathsConfig.app.messages, pathsConfig.parent.messages];

function revalidateCommunicationPaths() {
  for (const path of MESSAGES_PATHS) {
    revalidatePath(path);
  }

  revalidatePath(pathsConfig.app.home);
  revalidatePath(pathsConfig.parent.home);
}

function assertSchoolMatch(schoolId: string, contextSchoolId: string) {
  if (schoolId !== contextSchoolId) {
    throw new KinderError(
      KINDER_ERROR_CODES.SCHOOL_ACCESS_DENIED,
      'School mismatch',
    );
  }
}

async function loadStudentName(schoolId: string, studentId: string) {
  const client = getSupabaseServerClient();

  const { data, error } = await client
    .from('students')
    .select('full_name')
    .eq('school_id', schoolId)
    .eq('id', studentId)
    .single();

  if (error) {
    throw error;
  }

  return data.full_name;
}

export const sendCommunicationMessageAction = enhanceAction(
  async (data, user) => {
    const client = getSupabaseServerClient();
    const memberships = await client
      .from('school_members')
      .select('school_id, role')
      .eq('user_id', user.id)
      .neq('role', 'parent');

    const isStaff = (memberships.data ?? []).some(
      (row) => row.school_id === data.schoolId,
    );

    let senderType: CommunicationSenderType = 'parent';
    let thread;

    if (isStaff) {
      const context = await requireSchoolContext(user.id);

      assertSchoolMatch(data.schoolId, context.school.id);
      await assertPermissionFromContext(
        context,
        COMMUNICATION_PERMISSIONS.MESSAGES_VIEW,
      );

      thread = await assertStaffThreadAccess(
        data.schoolId,
        data.threadId,
        user.id,
        context.role,
      );
      senderType = 'staff';
    } else {
      thread = await assertParentThreadAccess(
        user.id,
        data.schoolId,
        data.threadId,
      );
    }

    if (data.attachmentStoragePath) {
      assertCommunicationMediaStoragePath(
        data.attachmentStoragePath,
        data.schoolId,
        data.threadId,
      );

      if (!isCommunicationImageMimeType(data.attachmentMimeType)) {
        throw new Error('Only image attachments are supported');
      }
    }

    if (data.replyToMessageId) {
      const { data: replyTarget, error: replyError } = await client
        .from('communication_messages')
        .select('id')
        .eq('id', data.replyToMessageId)
        .eq('school_id', data.schoolId)
        .eq('thread_id', data.threadId)
        .single();

      if (replyError || !replyTarget) {
        throw new Error('Reply message not found');
      }
    }

    const messagePreview = buildCommunicationMessagePreview({
      body: data.body,
      attachmentMimeType: data.attachmentMimeType,
    });

    const { data: message, error } = await client
      .from('communication_messages')
      .insert({
        school_id: data.schoolId,
        thread_id: data.threadId,
        sender_user_id: user.id,
        sender_type: senderType,
        body: data.body.trim(),
        attachment_storage_path: data.attachmentStoragePath || null,
        attachment_file_name: data.attachmentFileName || null,
        attachment_mime_type: data.attachmentMimeType || null,
        reply_to_message_id: data.replyToMessageId || null,
      })
      .select('*')
      .single();

    if (error || !message) {
      throw error ?? new Error('Failed to send message');
    }

    await client
      .from('communication_threads')
      .update({
        last_message_at: message.created_at,
        last_message_preview: messagePreview,
      })
      .eq('id', data.threadId);

    await client.from('communication_thread_reads').upsert(
      {
        thread_id: data.threadId,
        user_id: user.id,
        last_read_at: message.created_at,
      },
      { onConflict: 'thread_id,user_id' },
    );

    try {
      const studentName = await loadStudentName(
        thread.school_id,
        thread.student_id,
      );

      await notifyCommunicationMessageRecipients({
        thread,
        studentName,
        senderUserId: user.id,
        senderType,
        messagePreview,
        messageId: message.id,
      });
    } catch (notifyError) {
      console.error('Failed to notify communication recipients', notifyError);
    }

    revalidateCommunicationPaths();

    return { success: true, messageId: message.id };
  },
  { schema: SendCommunicationMessageSchema },
);

export const markCommunicationThreadReadAction = enhanceAction(
  async (data, user) => {
    const client = getSupabaseServerClient();

    const staffMembership = await client
      .from('school_members')
      .select('role')
      .eq('user_id', user.id)
      .eq('school_id', data.schoolId)
      .neq('role', 'parent')
      .maybeSingle();

    if (staffMembership.data) {
      const context = await requireSchoolContext(user.id);

      assertSchoolMatch(data.schoolId, context.school.id);
      await assertStaffThreadAccess(
        data.schoolId,
        data.threadId,
        user.id,
        context.role,
      );
    } else {
      await assertParentThreadAccess(user.id, data.schoolId, data.threadId);
    }

    const { error } = await client.from('communication_thread_reads').upsert(
      {
        thread_id: data.threadId,
        user_id: user.id,
        last_read_at: new Date().toISOString(),
      },
      { onConflict: 'thread_id,user_id' },
    );

    if (error) {
      throw error;
    }

    revalidateCommunicationPaths();

    return { success: true };
  },
  { schema: MarkCommunicationThreadReadSchema },
);

export const openCommunicationThreadAction = enhanceAction(
  async (data, user) => {
    const client = getSupabaseServerClient();

    const staffMembership = await client
      .from('school_members')
      .select('id')
      .eq('user_id', user.id)
      .eq('school_id', data.schoolId)
      .neq('role', 'parent')
      .maybeSingle();

    if (staffMembership.data) {
      const context = await requireSchoolContext(user.id);

      assertSchoolMatch(data.schoolId, context.school.id);
      await assertPermissionFromContext(
        context,
        COMMUNICATION_PERMISSIONS.MESSAGES_VIEW,
      );
    } else {
      const { assertParentStudentAccess } = await import('../parent/load-parent');

      await assertParentStudentAccess(user.id, data.studentId);
    }

    const thread = await openCommunicationThread(data);

    revalidateCommunicationPaths();

    return { success: true, threadId: thread.id };
  },
  { schema: OpenCommunicationThreadSchema },
);

export const toggleCommunicationReactionAction = enhanceAction(
  async (data, user) => {
    const client = getSupabaseServerClient();

    await assertCommunicationMessageAccess(
      user.id,
      data.schoolId,
      data.threadId,
      data.messageId,
    );

    const { data: existing, error: existingError } = await client
      .from('communication_message_reactions')
      .select('id, reaction')
      .eq('message_id', data.messageId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    if (existing?.reaction === data.reaction) {
      const { error } = await client
        .from('communication_message_reactions')
        .delete()
        .eq('id', existing.id);

      if (error) {
        throw error;
      }

      return { success: true, action: 'removed' as const };
    }

    const { error } = await client.from('communication_message_reactions').upsert(
      {
        message_id: data.messageId,
        school_id: data.schoolId,
        user_id: user.id,
        reaction: data.reaction,
      },
      { onConflict: 'message_id,user_id' },
    );

    if (error) {
      throw error;
    }

    return {
      success: true,
      action: existing ? ('changed' as const) : ('added' as const),
    };
  },
  { schema: ToggleCommunicationReactionSchema },
);
