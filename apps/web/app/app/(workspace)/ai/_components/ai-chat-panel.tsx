'use client';

import { useState, useTransition } from 'react';

import { Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Button } from '@kit/ui/button';
import { Input } from '@kit/ui/input';
import { Trans } from '@kit/ui/trans';

import { sendAiChatMessageAction } from '~/lib/kinder/ai/server-actions';
import { PanelEmpty } from '~/components/kinder-ui';
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
  const [sessionId, setSessionId] = useState(initialSessionId ?? sessions[0]?.id);
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
    <div className="kinder-surface flex h-[32rem] flex-col overflow-hidden">
      <div className="text-muted-foreground border-b px-4 py-2 text-xs">
        <Trans
          i18nKey="kinder:ai.creditsRemaining"
          values={{ count: creditsRemaining }}
        />
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <PanelEmpty messageKey="kinder:ai.chatEmpty" />
        ) : (
          messages.map((message) => (
            <div
              className={
                message.role === 'user'
                  ? 'bg-primary/10 ml-8 rounded-lg p-3 text-sm'
                  : 'bg-muted mr-8 rounded-lg p-3 text-sm'
              }
              key={message.id}
            >
              {message.content}
            </div>
          ))
        )}
      </div>
      <div className="flex gap-2 border-t p-3">
        <Input
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
        <Button disabled={pending || creditsRemaining <= 0} onClick={onSend} type="button">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
