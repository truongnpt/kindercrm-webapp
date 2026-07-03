'use client';

import { Building2, GraduationCap } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { cn } from '@kit/ui/utils';
import { Trans } from '@kit/ui/trans';

import { PanelEmpty } from '~/components/kinder-ui';
import { StudentAvatar } from '~/components/students/student-avatar';
import type {
  CommunicationChannel,
  CommunicationThreadSummary,
} from '~/lib/kinder/communication/types';

import {
  CHANNEL_STYLES,
  formatThreadTimestamp,
} from './communication-helpers';
import { COMMUNICATION_IMAGE_MESSAGE_PREVIEW } from '~/lib/kinder/communication/storage';

function ChannelIcon({ channel }: { channel: CommunicationChannel }) {
  const className = 'size-3 shrink-0';

  if (channel === 'homeroom') {
    return <GraduationCap className={className} />;
  }

  return <Building2 className={className} />;
}

export function CommunicationThreadList({
  threads,
  activeThreadId,
  mode,
  onSelectThread,
  className,
}: {
  threads: CommunicationThreadSummary[];
  activeThreadId?: string;
  mode: 'parent' | 'staff';
  onSelectThread: (threadId: string) => void;
  className?: string;
}) {
  const { t } = useTranslation('kinder');

  return (
    <aside className={cn('kinder-messages-sidebar', className)}>
      <div className="kinder-messages-sidebar-header">
        <p className="text-base font-semibold tracking-tight text-foreground">
          <Trans i18nKey="kinder:communication.conversations" />
        </p>
        <p className="text-muted-foreground mt-1 text-xs">
          <Trans
            i18nKey="kinder:communication.threadCount"
            values={{ count: threads.length }}
          />
        </p>
      </div>

      <div className="kinder-messages-thread-scroll">
        {threads.length === 0 ? (
          <div className="p-4">
            <PanelEmpty messageKey="kinder:communication.emptyThreads" />
          </div>
        ) : (
          <ul className="flex flex-col gap-1 p-2">
            {threads.map((thread) => {
              const isActive = thread.id === activeThreadId;
              const channelStyle = CHANNEL_STYLES[thread.channel];
              const subtitle =
                mode === 'parent'
                  ? [thread.schoolName].filter(Boolean).join(' · ')
                  : [thread.studentCode].filter(Boolean).join(' · ');

              return (
                <li key={thread.id}>
                  <button
                    className={cn(
                      'kinder-messages-thread',
                      isActive && 'kinder-messages-thread--active',
                    )}
                    onClick={() => onSelectThread(thread.id)}
                    type="button"
                  >
                    <StudentAvatar
                      className="kinder-messages-avatar"
                      fallbackClassName={channelStyle.avatarClassName}
                      name={thread.studentName}
                      photoUrl={thread.studentPhotoUrl}
                      size="lg"
                    />

                    <span className="min-w-0 flex-1">
                      <span className="flex items-start justify-between gap-3">
                        <span className="truncate text-sm font-semibold text-foreground">
                          {thread.studentName}
                        </span>
                        {thread.last_message_at ? (
                          <span className="text-muted-foreground shrink-0 text-[11px] tabular-nums">
                            {formatThreadTimestamp(thread.last_message_at, {
                              yesterday: t('communication.yesterday'),
                            })}
                          </span>
                        ) : null}
                      </span>

                      <span
                        className={cn(
                          'mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium',
                          channelStyle.className,
                        )}
                      >
                        <ChannelIcon channel={thread.channel} />
                        <Trans
                          i18nKey={`kinder:communication.channels.${thread.channel}`}
                        />
                      </span>

                      {subtitle ? (
                        <span className="text-muted-foreground mt-1 block truncate text-xs">
                          {subtitle}
                        </span>
                      ) : null}

                      {thread.last_message_preview ? (
                        <span className="text-muted-foreground mt-2 line-clamp-2 text-xs leading-relaxed">
                          {thread.last_message_preview ===
                          COMMUNICATION_IMAGE_MESSAGE_PREVIEW ? (
                            <Trans i18nKey="kinder:communication.imagePreview" />
                          ) : (
                            thread.last_message_preview
                          )}
                        </span>
                      ) : null}
                    </span>

                    {thread.unreadCount > 0 ? (
                      <span className="kinder-messages-unread">
                        {thread.unreadCount > 9 ? '9+' : thread.unreadCount}
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}
