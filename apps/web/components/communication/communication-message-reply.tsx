'use client';

import { CornerUpLeft, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@kit/ui/button';
import { cn } from '@kit/ui/utils';
import { Trans } from '@kit/ui/trans';

import {
  COMMUNICATION_IMAGE_MESSAGE_PREVIEW,
  isCommunicationImageMimeType,
} from '~/lib/kinder/communication/storage';
import { toReplyPreview } from '~/lib/kinder/communication/message-reply';
import type {
  CommunicationMessageReplyPreview,
  CommunicationMessageWithSender,
} from '~/lib/kinder/communication/types';

function ReplyPreviewText({
  replyTo,
}: {
  replyTo: CommunicationMessageReplyPreview;
}) {
  const { t } = useTranslation('kinder');

  if (
    replyTo.previewText === COMMUNICATION_IMAGE_MESSAGE_PREVIEW ||
    isCommunicationImageMimeType(replyTo.attachmentMimeType)
  ) {
    if (!replyTo.body.trim()) {
      return <Trans i18nKey="kinder:communication.imagePreview" />;
    }
  }

  return <>{replyTo.previewText}</>;
}

export function CommunicationReplyQuote({
  replyTo,
  isMine,
}: {
  replyTo: CommunicationMessageReplyPreview;
  isMine: boolean;
}) {
  return (
    <div
      className={cn(
        'kinder-messages-reply-quote',
        isMine
          ? 'kinder-messages-reply-quote--mine'
          : 'kinder-messages-reply-quote--theirs',
      )}
    >
      <p className="text-xs font-semibold">{replyTo.senderName}</p>
      <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed opacity-90">
        <ReplyPreviewText replyTo={replyTo} />
      </p>
    </div>
  );
}

export function CommunicationComposerReply({
  message,
  onCancel,
}: {
  message: CommunicationMessageWithSender;
  onCancel: () => void;
}) {
  const { t } = useTranslation('kinder');

  const replyTo = toReplyPreview(
    {
      id: message.id,
      school_id: message.school_id,
      thread_id: message.thread_id,
      sender_user_id: message.sender_user_id,
      sender_type: message.sender_type,
      body: message.body,
      attachment_storage_path: message.attachment_storage_path,
      attachment_file_name: message.attachment_file_name,
      attachment_mime_type: message.attachment_mime_type,
      reply_to_message_id: message.reply_to_message_id,
      created_at: message.created_at,
    },
    message.senderName,
  );

  return (
    <div className="kinder-messages-composer-reply">
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-primary">
          <CornerUpLeft className="size-3.5" />
          <Trans i18nKey="kinder:communication.replyingTo" />
          <span className="truncate text-foreground">{message.senderName}</span>
        </p>
        <p className="text-muted-foreground mt-1 line-clamp-2 text-xs leading-relaxed">
          <ReplyPreviewText replyTo={replyTo} />
        </p>
      </div>
      <Button
 aria-label={t('communication.cancelReply')}className="shrink-0"
 onClick={onCancel}
 size="icon"
 type="button"
 variant="ghost"
 >
        <X className="size-4" />
      </Button>
    </div>
  );
}

export function CommunicationReplyButton({
  onReply,
}: {
  onReply: () => void;
}) {
  const { t } = useTranslation('kinder');

  return (
    <Button className="opacity-0 transition-opacity group-hover/message:opacity-100"
 onClick={onReply}
 size="icon"
 type="button"
 variant="ghost"
 >
      <CornerUpLeft className="size-3.5" />
      <span className="sr-only">{t('communication.reply')}</span>
    </Button>
  );
}
