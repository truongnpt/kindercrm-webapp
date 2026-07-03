'use client';

import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

import pathsConfig from '~/config/paths.config';
import { markCommunicationThreadReadAction } from '~/lib/kinder/communication/server-actions';
import type {
  CommunicationMessageWithSender,
  CommunicationThreadSummary,
} from '~/lib/kinder/communication/types';
import { useCommunicationRealtime } from '~/lib/kinder/communication/use-communication-realtime';

import { CommunicationMessagePanel } from './communication-message-panel';
import { CommunicationThreadList } from './communication-thread-list';

function buildThreadHref(
  thread: CommunicationThreadSummary,
  mode: 'parent' | 'staff',
) {
  if (mode === 'staff') {
    return `${pathsConfig.app.messages}?threadId=${thread.id}`;
  }

  const params = new URLSearchParams({
    threadId: thread.id,
    studentId: thread.student_id,
    schoolId: thread.school_id,
  });

  return `${pathsConfig.parent.messages}?${params.toString()}`;
}

export function CommunicationWorkspace({
  schoolId,
  threads,
  messages,
  activeThreadId,
  currentUserId,
  mode,
}: {
  schoolId: string;
  threads: CommunicationThreadSummary[];
  messages: CommunicationMessageWithSender[];
  activeThreadId?: string;
  currentUserId: string;
  mode: 'parent' | 'staff';
}) {
  const router = useRouter();

  const { messages: liveMessages, threads: liveThreads, updateMessageReactions } =
    useCommunicationRealtime({
      schoolId,
      activeThreadId,
      currentUserId,
      initialMessages: messages,
      initialThreads: threads,
    });

  const activeLiveThread = liveThreads.find(
    (thread) => thread.id === activeThreadId,
  );

  useEffect(() => {
    if (!activeThreadId || !schoolId) {
      return;
    }

    void markCommunicationThreadReadAction({
      schoolId,
      threadId: activeThreadId,
    });
  }, [activeThreadId, schoolId]);

  const handleSelectThread = (threadId: string) => {
    const thread = liveThreads.find((item) => item.id === threadId);

    if (!thread) {
      return;
    }

    router.push(buildThreadHref(thread, mode));
  };

  const handleBackToList = () => {
    router.push(
      mode === 'staff'
        ? pathsConfig.app.messages
        : pathsConfig.parent.messages,
    );
  };

  useEffect(() => {
    if (activeThreadId || liveThreads.length === 0) {
      return;
    }

    const desktop = window.matchMedia('(min-width: 1024px)');

    if (desktop.matches) {
      router.replace(buildThreadHref(liveThreads[0]!, mode));
    }
  }, [activeThreadId, liveThreads, mode, router]);

  const showMobileChat = Boolean(activeThreadId);

  return (
    <div className="kinder-messages-layout">
      <CommunicationThreadList
        activeThreadId={activeThreadId}
        className={showMobileChat ? 'hidden lg:flex' : 'flex'}
        mode={mode}
        onSelectThread={handleSelectThread}
        threads={liveThreads}
      />

      <CommunicationMessagePanel
        className={showMobileChat ? 'flex' : 'hidden lg:flex'}
        currentUserId={currentUserId}
        messages={liveMessages}
        onBack={handleBackToList}
        onReactionsChange={updateMessageReactions}
        schoolId={schoolId}
        showBackButton={showMobileChat}
        thread={activeLiveThread}
      />
    </div>
  );
}
