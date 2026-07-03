'use client';

import { useEffect, useRef, useState, useTransition } from 'react';

import {
  Building2,
  ChevronLeft,
  GraduationCap,
  ImagePlus,
  Loader2,
  MessageSquareText,
  Send,
  X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import { Avatar, AvatarFallback, AvatarImage } from '@kit/ui/avatar';
import { Button } from '@kit/ui/button';
import { cn } from '@kit/ui/utils';
import { Trans } from '@kit/ui/trans';

import { PanelEmpty, useKinderMutation } from '~/components/kinder-ui';
import { StudentAvatar } from '~/components/students/student-avatar';
import { optimizeCommunicationImage } from '~/lib/kinder/communication/optimize-communication-image';
import { sendCommunicationMessageAction } from '~/lib/kinder/communication/server-actions';
import { uploadCommunicationImage } from '~/lib/kinder/communication/upload-communication-image';
import type {
  CommunicationChannel,
  CommunicationMessageWithSender,
  CommunicationReactionGroup,
  CommunicationThreadSummary,
} from '~/lib/kinder/communication/types';
import { kinderQueryKeys } from '~/lib/kinder/react-query';

import {
  CHANNEL_STYLES,
  dayKey,
  formatDaySeparator,
  formatMessageTimestamp,
  getInitials,
} from './communication-helpers';
import { CommunicationMessageReactions } from './communication-message-reactions';
import { CommunicationMessageImage } from './communication-message-image';
import {
  CommunicationComposerReply,
  CommunicationReplyButton,
  CommunicationReplyQuote,
} from './communication-message-reply';

function mapImageError(error: unknown, t: (key: string) => string) {
  const code = error instanceof Error ? error.message : '';

  if (code === 'UNSUPPORTED_IMAGE_TYPE') {
    return t('communication.unsupportedImage');
  }

  if (code === 'IMAGE_TOO_LARGE') {
    return t('communication.imageTooLarge');
  }

  if (code === 'IMAGE_LOAD_FAILED' || code === 'IMAGE_ENCODE_FAILED') {
    return t('communication.imageProcessFailed');
  }

  return error instanceof Error ? error.message : t('communication.sendFailed');
}

function ChannelIcon({ channel }: { channel: CommunicationChannel }) {
  const className = 'size-3.5 shrink-0';

  if (channel === 'homeroom') {
    return <GraduationCap className={className} />;
  }

  return <Building2 className={className} />;
}

function MessageSenderAvatar({
  name,
  pictureUrl,
}: {
  name: string;
  pictureUrl: string | null;
}) {
  return (
    <Avatar
      className={cn(
        'kinder-messages-avatar kinder-messages-avatar--sm mt-1 shrink-0',
        'bg-muted text-muted-foreground',
      )}
    >
      {pictureUrl ? <AvatarImage alt={name} src={pictureUrl} /> : null}
      <AvatarFallback className="bg-muted text-[10px] font-semibold tracking-wide text-muted-foreground">
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}

function MessageBubble({
  message,
  isMine,
  showSender,
  schoolId,
  threadId,
  onReactionsChange,
  onReply,
}: {
  message: CommunicationMessageWithSender;
  isMine: boolean;
  showSender: boolean;
  schoolId: string;
  threadId: string;
  onReactionsChange: (
    messageId: string,
    reactions: CommunicationReactionGroup[],
  ) => void;
  onReply: (message: CommunicationMessageWithSender) => void;
}) {
  return (
    <div
      className={cn(
        'kinder-messages-bubble-row group/message',
        isMine && 'kinder-messages-bubble-row--mine',
      )}
    >
      {!isMine ? (
        <MessageSenderAvatar
          name={message.senderName}
          pictureUrl={message.senderPictureUrl}
        />
      ) : null}

      <div
        className={cn(
          'flex min-w-0 max-w-[min(78%,28rem)] flex-col',
          isMine && 'items-end',
        )}
      >
        {!isMine && showSender ? (
          <span className="text-muted-foreground mb-1 px-1 text-xs font-medium">
            {message.senderName}
          </span>
        ) : null}

        <div
          className={cn(
            'kinder-messages-bubble',
            isMine
              ? 'kinder-messages-bubble--mine'
              : 'kinder-messages-bubble--theirs',
          )}
        >
          {message.replyTo ? (
            <CommunicationReplyQuote isMine={isMine} replyTo={message.replyTo} />
          ) : null}

          {message.body.trim() ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {message.body}
            </p>
          ) : null}

          <CommunicationMessageImage isMine={isMine} message={message} />
        </div>

        <span className="text-muted-foreground mt-1.5 px-1 text-[10px] tabular-nums">
          {formatMessageTimestamp(message.created_at)}
        </span>

        <div
          className={cn(
            'mt-1 flex flex-wrap items-center gap-1',
            isMine && 'justify-end',
          )}
        >
          <CommunicationMessageReactions
            isMine={isMine}
            messageId={message.id}
            onReactionsChange={(reactions) =>
              onReactionsChange(message.id, reactions)
            }
            reactions={message.reactions}
            schoolId={schoolId}
            threadId={threadId}
          />
          <CommunicationReplyButton onReply={() => onReply(message)} />
        </div>
      </div>
    </div>
  );
}

export function CommunicationMessagePanel({
  schoolId,
  thread,
  messages,
  currentUserId,
  onBack,
  showBackButton,
  className,
  onReactionsChange,
}: {
  schoolId: string;
  thread?: CommunicationThreadSummary;
  messages: CommunicationMessageWithSender[];
  currentUserId: string;
  onBack?: () => void;
  showBackButton?: boolean;
  className?: string;
  onReactionsChange: (
    messageId: string,
    reactions: CommunicationReactionGroup[],
  ) => void;
}) {
  const { t } = useTranslation('kinder');
  const supabase = useSupabase();
  const [input, setInput] = useState('');
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  const [pendingImagePreview, setPendingImagePreview] = useState<string | null>(
    null,
  );
  const [optimizingImage, setOptimizingImage] = useState(false);
  const [replyingTo, setReplyingTo] =
    useState<CommunicationMessageWithSender | null>(null);
  const [pending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const sendMessage = useKinderMutation({
    mutationFn: sendCommunicationMessageAction,
    invalidateKeys: schoolId
      ? [kinderQueryKeys.communication.all(schoolId)]
      : undefined,
    refresh: false,
    toast: false,
    onSuccess: () => {
      setInput('');
      setReplyingTo(null);
      textareaRef.current?.focus();
    },
  });

  useEffect(() => {
    setReplyingTo(null);
  }, [thread?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thread?.id]);

  useEffect(() => {
    return () => {
      if (pendingImagePreview) {
        URL.revokeObjectURL(pendingImagePreview);
      }
    };
  }, [pendingImagePreview]);

  const clearPendingImage = () => {
    if (pendingImagePreview) {
      URL.revokeObjectURL(pendingImagePreview);
    }

    setPendingImage(null);
    setPendingImagePreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageSelect = async (file: File | undefined) => {
    if (!file) {
      return;
    }

    setOptimizingImage(true);

    try {
      const { file: preparedFile, optimized } =
        await optimizeCommunicationImage(file);

      if (pendingImagePreview) {
        URL.revokeObjectURL(pendingImagePreview);
      }

      setPendingImage(preparedFile);
      setPendingImagePreview(URL.createObjectURL(preparedFile));

      if (optimized) {
        toast.success(t('communication.imageOptimized'));
      }
    } catch (error) {
      toast.error(mapImageError(error, t));
      clearPendingImage();
    } finally {
      setOptimizingImage(false);
    }
  };

  const canSend = Boolean(input.trim()) || Boolean(pendingImage);

  const handleSend = () => {
    if (!thread || !schoolId) {
      return;
    }

    if (!input.trim() && !pendingImage) {
      return;
    }

    const body = input.trim();
    const imageToUpload = pendingImage;
    const replyToMessageId = replyingTo?.id;

    setInput('');
    clearPendingImage();
    setReplyingTo(null);

    startTransition(async () => {
      try {
        let attachment:
          | {
              attachmentStoragePath: string;
              attachmentFileName: string;
              attachmentMimeType: string;
            }
          | undefined;

        if (imageToUpload) {
          const uploaded = await uploadCommunicationImage(supabase, {
            schoolId,
            threadId: thread.id,
            file: imageToUpload,
          });

          attachment = {
            attachmentStoragePath: uploaded.storagePath,
            attachmentFileName: uploaded.fileName,
            attachmentMimeType: uploaded.mimeType,
          };
        }

        await sendMessage.mutateAsync({
          schoolId,
          threadId: thread.id,
          body,
          replyToMessageId,
          ...attachment,
        });
      } catch (error) {
        toast.error(mapImageError(error, t));
      }
    });
  };

  if (!thread) {
    return (
      <div
        className={cn(
          'kinder-messages-main kinder-messages-main--empty',
          className,
        )}
      >
        <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
          <span className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <MessageSquareText className="size-8" />
          </span>
          <div className="max-w-sm space-y-2">
            <p className="text-lg font-semibold text-foreground">
              <Trans i18nKey="kinder:communication.selectThreadTitle" />
            </p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              <Trans i18nKey="kinder:communication.selectThread" />
            </p>
          </div>
        </div>
      </div>
    );
  }

  const channelStyle = CHANNEL_STYLES[thread.channel];
  let previousDay = '';
  let previousSenderId = '';

  return (
    <div className={cn('kinder-messages-main', className)}>
      <header className="kinder-messages-main-header">
        <div className="flex min-w-0 items-center gap-3">
          {showBackButton && onBack ? (
            <Button className="shrink-0 lg:hidden"
 onClick={onBack}
 size="icon"
 type="button"
 variant="ghost"
 >
              <ChevronLeft className="size-5" />
              <span className="sr-only">
                <Trans i18nKey="kinder:communication.backToList" />
              </span>
            </Button>
          ) : null}

          <StudentAvatar
            className="kinder-messages-avatar shrink-0"
            fallbackClassName={channelStyle.avatarClassName}
            name={thread.studentName}
            photoUrl={thread.studentPhotoUrl}
            size="lg"
          />

          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-foreground">
              {thread.studentName}
            </p>
            <p
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
                channelStyle.className,
              )}
            >
              <ChannelIcon channel={thread.channel} />
              <Trans
                i18nKey={`kinder:communication.channels.${thread.channel}`}
              />
            </p>
          </div>
        </div>
      </header>

      <div className="kinder-messages-scroll">
        {messages.length === 0 ? (
          <div className="flex h-full min-h-[16rem] items-center justify-center px-6">
            <PanelEmpty messageKey="kinder:communication.emptyMessages" />
          </div>
        ) : (
          <div className="mx-auto flex w-full max-w-3xl flex-col">
            {messages.map((message) => {
              const isMine = message.sender_user_id === currentUserId;
              const currentDay = dayKey(message.created_at);
              const showDaySeparator = currentDay !== previousDay;
              const showSender =
                !isMine && message.sender_user_id !== previousSenderId;

              previousDay = currentDay;
              previousSenderId = message.sender_user_id;

              return (
                <div key={message.id}>
                  {showDaySeparator ? (
                    <div className="kinder-messages-day-separator">
                      <span>
                        {formatDaySeparator(message.created_at, {
                          today: t('communication.today'),
                          yesterday: t('communication.yesterday'),
                        })}
                      </span>
                    </div>
                  ) : null}

                  <MessageBubble
                    isMine={isMine}
                    message={message}
                    onReactionsChange={onReactionsChange}
                    onReply={(target) => {
                      setReplyingTo(target);
                      textareaRef.current?.focus();
                    }}
                    schoolId={schoolId}
                    showSender={showSender}
                    threadId={thread.id}
                  />
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <footer className="kinder-messages-composer">
        {replyingTo ? (
          <CommunicationComposerReply
            message={replyingTo}
            onCancel={() => setReplyingTo(null)}
          />
        ) : null}

        {pendingImagePreview ? (
          <div className="kinder-messages-image-preview">
            <img
              alt={pendingImage?.name ?? 'Selected image'}
              className="size-full object-cover"
              src={pendingImagePreview}
            />
            <Button className="absolute top-2 right-2"
 onClick={clearPendingImage}
 size="icon"
 type="button"
 variant="secondary"
 >
              <X className="size-4" />
            </Button>
          </div>
        ) : null}

        <div className="kinder-messages-composer-inner">
          <input
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              void handleImageSelect(file);
            }}
            ref={fileInputRef}
            type="file"
          />

          <Button className="shrink-0"
 disabled={
 pending ||
 sendMessage.isPending ||
 optimizingImage ||
 !thread
 }
 onClick={() => fileInputRef.current?.click()}
            size="icon"
            type="button"
            variant="ghost"
          >
            {optimizingImage ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ImagePlus className="size-4" />
            )}
            <span className="sr-only">
              <Trans i18nKey="kinder:communication.attachImage" />
            </span>
          </Button>

          <textarea
            className="kinder-messages-input"
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                handleSend();
              }
            }}
            placeholder={t('communication.messagePlaceholder')}
            ref={textareaRef}
            rows={1}
            value={input}
          />
          <Button className="shrink-0"
 disabled={
 pending ||
 sendMessage.isPending ||
 optimizingImage ||
 !canSend ||
 (!input.trim() && !pendingImage)
 }
 onClick={handleSend}
 size="icon"
 type="button"
 variant="default"
 >
            <Send className="size-4" />
            <span className="sr-only">
              <Trans i18nKey="kinder:communication.send" />
            </span>
          </Button>
        </div>
        <p className="text-muted-foreground mt-2 hidden text-center text-[11px] sm:block">
          <Trans i18nKey="kinder:communication.sendHint" />
        </p>
      </footer>
    </div>
  );
}
