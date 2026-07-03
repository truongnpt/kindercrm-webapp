import { z } from 'zod';

import { COMMUNICATION_CHANNELS, COMMUNICATION_REACTIONS } from '../types';

export const EnsureCommunicationThreadsSchema = z.object({
  schoolId: z.string().uuid(),
  studentId: z.string().uuid(),
});

export const SendCommunicationMessageSchema = z
  .object({
    schoolId: z.string().uuid(),
    threadId: z.string().uuid(),
    body: z.string().max(5000).default(''),
    attachmentStoragePath: z.string().max(500).optional(),
    attachmentFileName: z.string().max(255).optional(),
    attachmentMimeType: z.string().max(100).optional(),
    replyToMessageId: z.string().uuid().optional(),
  })
  .refine(
    (data) =>
      data.body.trim().length > 0 || Boolean(data.attachmentStoragePath?.trim()),
    { message: 'Message text or image is required' },
  );

export const MarkCommunicationThreadReadSchema = z.object({
  schoolId: z.string().uuid(),
  threadId: z.string().uuid(),
});

export const OpenCommunicationThreadSchema = z.object({
  schoolId: z.string().uuid(),
  studentId: z.string().uuid(),
  channel: z.enum(COMMUNICATION_CHANNELS),
});

export const ToggleCommunicationReactionSchema = z.object({
  schoolId: z.string().uuid(),
  threadId: z.string().uuid(),
  messageId: z.string().uuid(),
  reaction: z.enum(COMMUNICATION_REACTIONS),
});
