import type {
  CommunicationMessage,
  CommunicationMessageReplyPreview,
} from './types';
import {
  COMMUNICATION_IMAGE_MESSAGE_PREVIEW,
  isCommunicationImageMimeType,
} from './storage';

export function buildReplyPreviewText(message: {
  body: string;
  attachment_mime_type?: string | null;
}) {
  const trimmed = message.body.trim();

  if (trimmed) {
    return trimmed.slice(0, 160);
  }

  if (isCommunicationImageMimeType(message.attachment_mime_type)) {
    return COMMUNICATION_IMAGE_MESSAGE_PREVIEW;
  }

  return '';
}

export function toReplyPreview(
  message: CommunicationMessage,
  senderName: string,
): CommunicationMessageReplyPreview {
  return {
    id: message.id,
    senderName,
    body: message.body,
    attachmentMimeType: message.attachment_mime_type,
    previewText: buildReplyPreviewText(message),
  };
}

export function mergeReplyPreviews<
  T extends CommunicationMessage & {
    senderName: string;
  },
>(
  messages: T[],
  replyTargets: Map<string, CommunicationMessage & { senderName: string }>,
) {
  const byId = new Map(messages.map((message) => [message.id, message]));

  return messages.map((message) => {
    if (!message.reply_to_message_id) {
      return { ...message, replyTo: null as CommunicationMessageReplyPreview | null };
    }

    const target =
      byId.get(message.reply_to_message_id) ??
      replyTargets.get(message.reply_to_message_id);

    if (!target) {
      return { ...message, replyTo: null as CommunicationMessageReplyPreview | null };
    }

    return {
      ...message,
      replyTo: toReplyPreview(target, target.senderName),
    };
  });
}
