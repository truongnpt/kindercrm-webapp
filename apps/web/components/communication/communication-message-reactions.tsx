'use client';

import { useState, useTransition } from 'react';

import { SmilePlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Button } from '@kit/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@kit/ui/popover';
import { cn } from '@kit/ui/utils';

import { useKinderMutation } from '~/components/kinder-ui';
import { toggleCommunicationReactionAction } from '~/lib/kinder/communication/server-actions';
import type {
  CommunicationReaction,
  CommunicationReactionGroup,
} from '~/lib/kinder/communication/types';
import {
  COMMUNICATION_REACTIONS,
  COMMUNICATION_REACTION_EMOJI,
} from '~/lib/kinder/communication/types';
import {
  applyReactionToggle,
  resolveReactionToggleAction,
} from '~/lib/kinder/communication/group-message-reactions';

export function CommunicationMessageReactions({
  schoolId,
  threadId,
  messageId,
  reactions,
  isMine,
  onReactionsChange,
}: {
  schoolId: string;
  threadId: string;
  messageId: string;
  reactions: CommunicationReactionGroup[];
  isMine: boolean;
  onReactionsChange: (reactions: CommunicationReactionGroup[]) => void;
}) {
  const { t } = useTranslation('kinder');
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const toggleReaction = useKinderMutation({
    mutationFn: toggleCommunicationReactionAction,
    refresh: false,
    toast: false,
  });

  const handleToggle = (reaction: CommunicationReaction) => {
    const action = resolveReactionToggleAction(reactions, reaction);
    const optimistic = applyReactionToggle(reactions, reaction, '', action);

    onReactionsChange(optimistic);
    setOpen(false);

    startTransition(async () => {
      try {
        await toggleReaction.mutateAsync({
          schoolId,
          threadId,
          messageId,
          reaction,
        });
      } catch (error) {
        onReactionsChange(reactions);
        toast.error(
          error instanceof Error
            ? error.message
            : t('communication.reactionFailed'),
        );
      }
    });
  };

  return (
    <div
      className={cn(
        'group/reactions relative mt-1 flex flex-wrap items-center gap-1.5',
        isMine ? 'justify-end' : 'justify-start',
      )}
    >
      {reactions.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {reactions.map((group) => (
            <button
              className={cn(
                'kinder-messages-reaction-pill',
                group.reactedByMe && 'kinder-messages-reaction-pill--active',
              )}
              disabled={pending || toggleReaction.isPending}
              key={group.reaction}
              onClick={() => handleToggle(group.reaction)}
              title={t(`communication.reactions.${group.reaction}`)}
              type="button"
            >
              <span aria-hidden>{group.emoji}</span>
              <span className="text-[11px] font-semibold tabular-nums">
                {group.count}
              </span>
            </button>
          ))}
        </div>
      ) : null}

      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild>
          <Button
 className={cn(
 'opacity-0 transition-opacity group-hover/reactions:opacity-100',
 open && 'opacity-100',
 reactions.length === 0 && 'opacity-100 sm:opacity-0 sm:group-hover/reactions:opacity-100',
 )}
 size="icon"
 type="button"
 variant="ghost"
 >
            <SmilePlus className="size-4" />
            <span className="sr-only">
              {t('communication.addReaction')}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align={isMine ? 'end' : 'start'}
          className="w-auto rounded-2xl p-2"
          side="top"
        >
          <div className="flex items-center gap-1">
            {COMMUNICATION_REACTIONS.map((reaction) => (
              <button
                className={cn(
                  'flex size-10 items-center justify-center rounded-xl text-xl transition-colors hover:bg-muted',
                  reactions.some(
                    (group) =>
                      group.reaction === reaction && group.reactedByMe,
                  ) && 'bg-primary/10 ring-1 ring-primary/20',
                )}
                disabled={pending || toggleReaction.isPending}
                key={reaction}
                onClick={() => handleToggle(reaction)}
                title={t(`communication.reactions.${reaction}`)}
                type="button"
              >
                {COMMUNICATION_REACTION_EMOJI[reaction]}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
