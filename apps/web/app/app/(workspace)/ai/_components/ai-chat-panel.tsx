'use client';

import { useState, useTransition } from 'react';

import { Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Button } from '@kit/ui/button';
import { Input } from '@kit/ui/input';
import { cn } from '@kit/ui/utils';
import { Trans } from '@kit/ui/trans';

import { PanelEmpty } from '~/components/kinder-ui';
import { sendAiChatMessageAction } from '~/lib/kinder/ai/server-actions';
import type { AiChatMessage, AiChatSession } from '~/lib/kinder/ai/types';

export function AiChatPanel({
  schoolId,
  sessions,
  initialMessages,
  initialSessionId,
  creditsRemaining,
}: {
  schoolId: string;
  sessions: AiChatSession[];
  initialMessages: AiChatMessage[];
  initialSessionId?: string;
  creditsRemaining: number;
}) {
  const { t } = useTranslation('kinder');
  const [pending, startTransition] = useTransition();
  const [sessionId, setSessionId] = useState(
    initialSessionId ?? sessions[0]?.id,
  );
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');

  const onSend = () => {
    if (!input.trim()) {
      return;
    }

    const userMessage = input.trim();
    setInput('');
    setMessages((current) => [
      ...current,
      {
        id: `temp-${Date.now()}`,
        school_id: schoolId,
        session_id: sessionId ?? '',
        role: 'user',
        content: userMessage,
        credits_used: 0,
        created_at: new Date().toISOString(),
      },
    ]);

    startTransition(async () => {
      try {
        const result = await sendAiChatMessageAction({
          schoolId,
          sessionId,
          message: userMessage,
        });

        setSessionId(result.sessionId);
        setMessages((current) => [
          ...current,
          {
            id: `assistant-${Date.now()}`,
            school_id: schoolId,
            session_id: result.sessionId,
            role: 'assistant',
            content: result.reply,
            credits_used: 0,
            created_at: new Date().toISOString(),
          },
        ]);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : t('common:genericServerError', { ns: 'common' }),
        );
      }
    });
  };

  return (
    <div className="kinder-chat-layout">
      <aside className="kinder-chat-sidebar">
        <div className="border-b border-border px-4 py-3">
          <p className="text-foreground text-sm font-semibold">
            <Trans i18nKey="kinder:ai.chatSessions" />
          </p>
          <p className="text-muted-foreground mt-1 text-xs">
            <Trans
              i18nKey="kinder:ai.creditsRemaining"
              values={{ count: creditsRemaining }}
            />
          </p>
        </div>
        <ul className="max-h-48 overflow-y-auto lg:max-h-none lg:flex-1">
          {sessions.length === 0 ? (
            <li className="text-muted-foreground px-4 py-6 text-center text-sm">
              <Trans i18nKey="kinder:ai.noSessions" />
            </li>
          ) : (
            sessions.map((session) => (
              <li key={session.id}>
                <button
                  className={cn(
                    'hover:bg-muted/50 w-full border-b border-border/60 px-4 py-3 text-left text-sm transition-colors',
                    sessionId === session.id && 'bg-primary/5 text-primary',
                  )}
                  onClick={() => {
                    setSessionId(session.id);
                    setMessages([]);
                  }}
                  type="button"
                >
                  <p className="line-clamp-2 font-medium">
                    {session.title || t('ai.newChat')}
                  </p>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    {new Date(session.updated_at).toLocaleString()}
                  </p>
                </button>
              </li>
            ))
          )}
        </ul>
      </aside>

      <div className="kinder-chat-main">
        <div className="kinder-chat-messages">
          {messages.length === 0 ? (
            <PanelEmpty messageKey="kinder:ai.chatEmpty" />
          ) : (
            messages.map((message) => (
              <div
                className={
                  message.role === 'user'
                    ? 'kinder-chat-bubble--user'
                    : 'kinder-chat-bubble--assistant'
                }
                key={message.id}
              >
                {message.content}
              </div>
            ))
          )}
        </div>
        <div className="kinder-chat-composer">
          <Input
            className="h-11 flex-1 rounded-lg border-border bg-muted/30 shadow-none"
            disabled={pending || creditsRemaining <= 0}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                onSend();
              }
            }}
            placeholder={t('ai.chatPlaceholder')}
            value={input}
          />
          <Button
            className="rounded-lg"
            disabled={pending || creditsRemaining <= 0}
            onClick={onSend}
            type="button"
          >
            <Send className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
