export const COMMUNICATION_CHANNELS = ['homeroom', 'school_office'] as const;

export type CommunicationChannel = (typeof COMMUNICATION_CHANNELS)[number];

export const COMMUNICATION_REACTIONS = [
  'like',
  'love',
  'haha',
  'wow',
  'sad',
  'thanks',
] as const;

export type CommunicationReaction = (typeof COMMUNICATION_REACTIONS)[number];

export const COMMUNICATION_REACTION_EMOJI: Record<CommunicationReaction, string> =
  {
    like: '👍',
    love: '❤️',
    haha: '😂',
    wow: '😮',
    sad: '😢',
    thanks: '🙏',
  };

export type CommunicationSenderType = 'parent' | 'staff';

export type CommunicationThread = {
  id: string;
  school_id: string;
  student_id: string;
  channel: CommunicationChannel;
  class_id: string | null;
  last_message_at: string | null;
  last_message_preview: string | null;
  created_at: string;
  updated_at: string;
};

export type CommunicationMessage = {
  id: string;
  school_id: string;
  thread_id: string;
  sender_user_id: string;
  sender_type: CommunicationSenderType;
  body: string;
  attachment_storage_path: string | null;
  attachment_file_name: string | null;
  attachment_mime_type: string | null;
  reply_to_message_id: string | null;
  created_at: string;
};

export type CommunicationThreadSummary = CommunicationThread & {
  studentName: string;
  studentCode: string;
  studentPhotoUrl: string | null;
  schoolName: string;
  unreadCount: number;
};

export type CommunicationMessageReaction = {
  id: string;
  message_id: string;
  school_id: string;
  user_id: string;
  reaction: CommunicationReaction;
  created_at: string;
};

export type CommunicationReactionGroup = {
  reaction: CommunicationReaction;
  emoji: string;
  count: number;
  reactedByMe: boolean;
};

export type CommunicationMessageReplyPreview = {
  id: string;
  senderName: string;
  body: string;
  attachmentMimeType: string | null;
  previewText: string;
};

export type CommunicationMessageWithSender = CommunicationMessage & {
  senderName: string;
  senderPictureUrl: string | null;
  reactions: CommunicationReactionGroup[];
  replyTo: CommunicationMessageReplyPreview | null;
};
