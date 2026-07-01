import 'server-only';

import { cache } from 'react';

import { getSupabaseServerClient } from '@kit/supabase/server-client';

import type {
  AiChatMessage,
  AiChatSession,
  AiKnowledgeArticle,
} from './types';

export const loadAiChatSessions = cache(
  async (schoolId: string, userId: string) => {
    const client = getSupabaseServerClient();

    const { data, error } = await client
      .from('ai_chat_sessions')
      .select('*')
      .eq('school_id', schoolId)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(20);

    if (error) {
      throw error;
    }

    return (data ?? []) as AiChatSession[];
  },
);

export const loadAiChatMessages = cache(
  async (schoolId: string, sessionId: string) => {
    const client = getSupabaseServerClient();

    const { data, error } = await client
      .from('ai_chat_messages')
      .select('*')
      .eq('school_id', schoolId)
      .eq('session_id', sessionId)
      .order('created_at');

    if (error) {
      throw error;
    }

    return (data ?? []) as AiChatMessage[];
  },
);

export const loadAiKnowledgeArticles = cache(async (schoolId: string) => {
  const client = getSupabaseServerClient();

  const { data, error } = await client
    .from('ai_knowledge_articles')
    .select('*')
    .eq('school_id', schoolId)
    .eq('is_active', true)
    .order('updated_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as AiKnowledgeArticle[];
});

export async function loadActiveKnowledgeSnippets(schoolId: string) {
  const articles = await loadAiKnowledgeArticles(schoolId);

  return articles
    .slice(0, 8)
    .map((article) => `${article.title}:\n${article.content.slice(0, 500)}`);
}
