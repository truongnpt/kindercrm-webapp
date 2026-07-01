import { z } from 'zod';

export const SendAiChatMessageSchema = z.object({
  schoolId: z.string().uuid(),
  sessionId: z.string().uuid().optional(),
  message: z.string().min(1).max(4000),
});

export const UpsertAiKnowledgeSchema = z.object({
  id: z.string().uuid().optional(),
  schoolId: z.string().uuid(),
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(10000),
  category: z.string().max(100).default('general'),
});

export const DeleteAiKnowledgeSchema = z.object({
  schoolId: z.string().uuid(),
  articleId: z.string().uuid(),
});

export const SuggestDailyCommentSchema = z.object({
  schoolId: z.string().uuid(),
  studentName: z.string().min(1).max(200),
  mood: z.string().max(100).optional().or(z.literal('')),
  mealSummary: z.string().max(500).optional().or(z.literal('')),
  activities: z.string().max(1000).optional().or(z.literal('')),
});

export const GenerateAiInsightsSchema = z.object({
  schoolId: z.string().uuid(),
});

export const DraftAiNotificationSchema = z.object({
  schoolId: z.string().uuid(),
  topic: z.string().min(1).max(200),
  audience: z.enum(['parents', 'staff', 'all']).default('parents'),
});
