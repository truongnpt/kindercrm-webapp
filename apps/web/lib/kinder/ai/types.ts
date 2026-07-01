import type { Database } from '~/lib/database.types';

export type AiChatSession =
  Database['public']['Tables']['ai_chat_sessions']['Row'];

export type AiChatMessage =
  Database['public']['Tables']['ai_chat_messages']['Row'];

export type AiKnowledgeArticle =
  Database['public']['Tables']['ai_knowledge_articles']['Row'];

export type AiCreditUsage =
  Database['public']['Tables']['ai_credit_usage']['Row'];

export type AiMessageRole = Database['public']['Enums']['ai_message_role'];

export type AiActionType = Database['public']['Enums']['ai_action_type'];

export type AiCompletionMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export type SchoolAiContext = {
  schoolName: string;
  studentCount: number;
  classCount: number;
  leadCount: number;
  enrolledThisMonth: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
  attendanceRate: number;
  publishedReportsToday: number;
  lowStockProducts: number;
};

export type AiInsightReport = {
  enrollmentForecast: string;
  revenueForecast: string;
  summary: string;
};
