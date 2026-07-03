'use client';

import { useEffect, useRef, useState } from 'react';

import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

import { markCommunicationThreadReadAction } from './server-actions';
import { groupMessageReactions } from './group-message-reactions';
import {
  buildSenderProfileMap,
  type CommunicationSenderProfile,
} from './load-sender-profiles';
import { toReplyPreview } from './message-reply';
import { buildCommunicationMessagePreview } from './storage';
import type {
  CommunicationMessage,
  CommunicationMessageReaction,
  CommunicationMessageWithSender,
  CommunicationReactionGroup,
  CommunicationThread,
  CommunicationThreadSummary,
} from './types';

async function loadSenderProfiles(
  client: SupabaseClient,
  userIds: string[],
  cache: Map<string, CommunicationSenderProfile>,
) {
  const missing = userIds.filter((userId) => !cache.has(userId));

  if (missing.length === 0) {
    return;
  }

  const [{ data: accounts }, { data: staff }] = await Promise.all([
    client.from('accounts').select('id, name, picture_url').in('id', missing),
    client
      .from('staff_employees')
      .select('user_id, full_name')
      .in('user_id', missing)
      .is('deleted_at', null),
  ]);

  const profiles = buildSenderProfileMap(missing, accounts ?? [], staff ?? []);

  for (const [userId, profile] of profiles) {
    cache.set(userId, profile);
  }
}

function sortThreads(threads: CommunicationThreadSummary[]) {
  return [...threads].sort((left, right) => {
    const leftTime = left.last_message_at ?? left.created_at;
    const rightTime = right.last_message_at ?? right.created_at;

    return rightTime.localeCompare(leftTime);
  });
}

export function useCommunicationRealtime({
  schoolId,
  activeThreadId,
  currentUserId,
  initialMessages,
  initialThreads,
}: {
  schoolId: string;
  activeThreadId?: string;
  currentUserId: string;
  initialMessages: CommunicationMessageWithSender[];
  initialThreads: CommunicationThreadSummary[];
}) {
  const supabase = useSupabase();
  const [messages, setMessages] = useState(initialMessages);
  const [threads, setThreads] = useState(initialThreads);
  const nameCache = useRef(new Map<string, CommunicationSenderProfile>());

  useEffect(() => {
    setMessages(initialMessages);

    for (const message of initialMessages) {
      nameCache.current.set(message.sender_user_id, {
        name: message.senderName,
        pictureUrl: message.senderPictureUrl,
      });
    }
  }, [initialMessages]);

  useEffect(() => {
    setThreads(initialThreads);
  }, [initialThreads]);

  useEffect(() => {
    if (!activeThreadId) {
      return;
    }

    setThreads((current) =>
      current.map((thread) =>
        thread.id === activeThreadId ? { ...thread, unreadCount: 0 } : thread,
      ),
    );
  }, [activeThreadId]);

  useEffect(() => {
    const channel = supabase
      .channel(`communication:${currentUserId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'communication_messages',
        },
        async (payload) => {
          const row = payload.new as CommunicationMessage;

          await loadSenderProfiles(supabase, [row.sender_user_id], nameCache.current);

          const sender = nameCache.current.get(row.sender_user_id);

          const replyTo = await resolveReplyPreview(
            supabase,
            row,
            messages,
            nameCache.current,
          );

          const withSender: CommunicationMessageWithSender = {
            ...row,
            senderName: sender?.name ?? '—',
            senderPictureUrl: sender?.pictureUrl ?? null,
            reactions: [],
            replyTo,
          };

          if (row.thread_id === activeThreadId) {
            setMessages((current) => {
              if (current.some((message) => message.id === row.id)) {
                return current;
              }

              return [...current, withSender];
            });

            if (row.sender_user_id !== currentUserId) {
              void markCommunicationThreadReadAction({
                schoolId: row.school_id,
                threadId: row.thread_id,
              });
            }
          }

          setThreads((current) => {
            if (!current.some((thread) => thread.id === row.thread_id)) {
              return current;
            }

            const isActive = row.thread_id === activeThreadId;
            const isIncoming = row.sender_user_id !== currentUserId;

            const next = current.map((thread) => {
              if (thread.id !== row.thread_id) {
                return thread;
              }

              return {
                ...thread,
                last_message_at: row.created_at,
                last_message_preview: buildCommunicationMessagePreview({
                  body: row.body,
                  attachmentMimeType: row.attachment_mime_type,
                }),
                unreadCount:
                  isActive || !isIncoming
                    ? thread.unreadCount
                    : thread.unreadCount + 1,
              };
            });

            return sortThreads(next);
          });
        },
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'communication_message_reactions',
        },
        async (payload) => {
          const row = (payload.new ?? payload.old) as
            | CommunicationMessageReaction
            | null;

          if (!row?.message_id) {
            return;
          }

          const { data, error } = await supabase
            .from('communication_message_reactions')
            .select('*')
            .eq('message_id', row.message_id);

          if (error) {
            return;
          }

          const reactions = groupMessageReactions(
            (data ?? []) as CommunicationMessageReaction[],
            currentUserId,
          );

          setMessages((current) => {
            if (!current.some((message) => message.id === row.message_id)) {
              return current;
            }

            return current.map((message) =>
              message.id === row.message_id
                ? { ...message, reactions }
                : message,
            );
          });
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'communication_threads',
        },
        (payload) => {
          const row = payload.new as CommunicationThread;

          setThreads((current) => {
            if (!current.some((thread) => thread.id === row.id)) {
              return current;
            }

            return sortThreads(
              current.map((thread) =>
                thread.id === row.id
                  ? {
                      ...thread,
                      last_message_at: row.last_message_at,
                      last_message_preview: row.last_message_preview,
                      class_id: row.class_id,
                      updated_at: row.updated_at,
                    }
                  : thread,
              ),
            );
          });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [activeThreadId, currentUserId, supabase]);

  const updateMessageReactions = (
    messageId: string,
    reactions: CommunicationReactionGroup[],
  ) => {
    setMessages((current) =>
      current.map((message) =>
        message.id === messageId ? { ...message, reactions } : message,
      ),
    );
  };

  return { messages, threads, updateMessageReactions };
}

async function resolveReplyPreview(
  client: SupabaseClient,
  message: CommunicationMessage,
  currentMessages: CommunicationMessageWithSender[],
  profileCache: Map<string, CommunicationSenderProfile>,
) {
  if (!message.reply_to_message_id) {
    return null;
  }

  const inThread = currentMessages.find(
    (item) => item.id === message.reply_to_message_id,
  );

  if (inThread) {
    return toReplyPreview(inThread, inThread.senderName);
  }

  const { data } = await client
    .from('communication_messages')
    .select('*')
    .eq('id', message.reply_to_message_id)
    .maybeSingle();

  if (!data) {
    return null;
  }

  await loadSenderProfiles(client, [data.sender_user_id], profileCache);

  return toReplyPreview(
    data as CommunicationMessage,
    profileCache.get(data.sender_user_id)?.name ?? '—',
  );
}
