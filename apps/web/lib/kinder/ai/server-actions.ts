'use server';

import { revalidatePath } from 'next/cache';

import { enhanceAction } from '@kit/next/actions';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import pathsConfig from '~/config/paths.config';
import { getSchoolContext } from '~/lib/kinder/tenant/get-school-context';
import { requirePackageFeature } from '~/lib/kinder/subscription/features';

import { consumeAiCredits } from './credits';
import { loadActiveKnowledgeSnippets } from './load-ai';
import { completeAiChat, generateAiText } from './provider';
import {
  buildRuleBasedInsights,
  buildSchoolAiContext,
  formatSchoolContextForPrompt,
} from './school-context';
import {
  DeleteAiKnowledgeSchema,
  DraftAiNotificationSchema,
  GenerateAiInsightsSchema,
  SendAiChatMessageSchema,
  SuggestDailyCommentSchema,
  UpsertAiKnowledgeSchema,
} from './schemas/ai.schema';

const AI_PATH = pathsConfig.app.ai;

function revalidateAiPaths() {
  revalidatePath(AI_PATH);
  revalidatePath(pathsConfig.app.home);
  revalidatePath(pathsConfig.app.dailyReports);
}

async function requireAiContext(userId: string, schoolId: string) {
  const context = await getSchoolContext(userId);

  if (!context || context.school.id !== schoolId) {
    throw new Error('School context not found');
  }

  requirePackageFeature(context, 'ai_assistant');

  return context;
}

/** AI-001 Chat */
export const sendAiChatMessageAction = enhanceAction(
  async (data, user) => {
    const context = await requireAiContext(user.id, data.schoolId);
    const client = getSupabaseServerClient();

    let sessionId = data.sessionId;

    if (!sessionId) {
      const { data: session, error } = await client
        .from('ai_chat_sessions')
        .insert({
          school_id: data.schoolId,
          user_id: user.id,
          title: data.message.slice(0, 80),
        })
        .select('id')
        .single();

      if (error) {
        throw error;
      }

      sessionId = session.id;
    }

    const [history, knowledge, schoolContext] = await Promise.all([
      client
        .from('ai_chat_messages')
        .select('role, content')
        .eq('session_id', sessionId)
        .eq('school_id', data.schoolId)
        .order('created_at')
        .limit(20),
      loadActiveKnowledgeSnippets(data.schoolId),
      buildSchoolAiContext(data.schoolId, context.school.name),
    ]);

    await client.from('ai_chat_messages').insert({
      school_id: data.schoolId,
      session_id: sessionId,
      role: 'user',
      content: data.message,
      credits_used: 0,
    });

    const completion = await completeAiChat({
      messages: [
        ...(history.data ?? []).map((row) => ({
          role: row.role as 'user' | 'assistant' | 'system',
          content: row.content,
        })),
        { role: 'user' as const, content: data.message },
      ],
      knowledgeSnippets: knowledge,
      schoolContext: formatSchoolContextForPrompt(schoolContext),
    });

    await consumeAiCredits({
      schoolId: data.schoolId,
      pkg: context.package,
      credits: completion.creditsUsed,
      actionType: 'chat',
    });

    await client.from('ai_chat_messages').insert({
      school_id: data.schoolId,
      session_id: sessionId,
      role: 'assistant',
      content: completion.content,
      credits_used: completion.creditsUsed,
    });

    await client
      .from('ai_chat_sessions')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', sessionId);

    revalidateAiPaths();

    return {
      success: true,
      sessionId,
      reply: completion.content,
      provider: completion.provider,
    };
  },
  { schema: SendAiChatMessageSchema },
);

/** AI-003 Daily comment suggestion */
export const suggestDailyCommentAction = enhanceAction(
  async (data, user) => {
    const context = await requireAiContext(user.id, data.schoolId);
    const schoolContext = await buildSchoolAiContext(
      data.schoolId,
      context.school.name,
    );

    const prompt = `Viết ghi chú giáo viên ngắn gọn (2-3 câu, tiếng Việt, thân thiện) cho nhật ký học sinh mầm non.
Học sinh: ${data.studentName}
Tâm trạng: ${data.mood || 'bình thường'}
Bữa ăn: ${data.mealSummary || 'đầy đủ'}
Hoạt động: ${data.activities || 'chơi và học theo chương trình'}
Không dùng bullet, không tiêu đề.`;

    const completion = await generateAiText({
      prompt,
      schoolContext: formatSchoolContextForPrompt(schoolContext),
      maxTokens: 200,
    });

    await consumeAiCredits({
      schoolId: data.schoolId,
      pkg: context.package,
      credits: completion.creditsUsed,
      actionType: 'daily_comment',
    });

    return { success: true, suggestion: completion.content };
  },
  { schema: SuggestDailyCommentSchema },
);

/** AI-002 / AI-004 / AI-005 Insights report */
export const generateAiInsightsAction = enhanceAction(
  async (data, user) => {
    const context = await requireAiContext(user.id, data.schoolId);
    const schoolContext = await buildSchoolAiContext(
      data.schoolId,
      context.school.name,
    );
    const ruleBased = buildRuleBasedInsights(schoolContext);

    const completion = await generateAiText({
      prompt: `Dựa trên dữ liệu trường, viết báo cáo ngắn 3 đoạn:
1) Dự báo tuyển sinh tháng tới
2) Dự báo doanh thu tháng tới  
3) Tóm tắt vận hành hôm nay
Mỗi đoạn 1-2 câu, tiếng Việt.`,
      schoolContext: formatSchoolContextForPrompt(schoolContext),
      maxTokens: 500,
    });

    await consumeAiCredits({
      schoolId: data.schoolId,
      pkg: context.package,
      credits: completion.creditsUsed,
      actionType: 'report',
    });

    const parts = completion.content.split('\n').filter(Boolean);

    return {
      success: true,
      enrollmentForecast: parts[0] ?? ruleBased.enrollmentForecast,
      revenueForecast: parts[1] ?? ruleBased.revenueForecast,
      summary: parts.slice(2).join(' ') || ruleBased.summary,
      provider: completion.provider,
    };
  },
  { schema: GenerateAiInsightsSchema },
);

/** AI-006 Notification draft */
export const draftAiNotificationAction = enhanceAction(
  async (data, user) => {
    const context = await requireAiContext(user.id, data.schoolId);

    const audienceLabel =
      data.audience === 'parents'
        ? 'phụ huynh'
        : data.audience === 'staff'
          ? 'nhân viên'
          : 'toàn trường';

    const completion = await generateAiText({
      prompt: `Soạn thông báo gửi ${audienceLabel} về chủ đề: "${data.topic}".
Trả về JSON với 2 field: title (tối đa 80 ký tự) và body (2-4 câu, tiếng Việt). Chỉ trả JSON.`,
      maxTokens: 300,
    });

    await consumeAiCredits({
      schoolId: data.schoolId,
      pkg: context.package,
      credits: completion.creditsUsed,
      actionType: 'notification_draft',
    });

    let title = data.topic;
    let body = completion.content;

    try {
      const parsed = JSON.parse(completion.content) as {
        title?: string;
        body?: string;
      };
      title = parsed.title ?? title;
      body = parsed.body ?? body;
    } catch {
      body = completion.content;
    }

    return { success: true, title, body };
  },
  { schema: DraftAiNotificationSchema },
);

/** AI-007 Knowledge base */
export const upsertAiKnowledgeAction = enhanceAction(
  async (data, user) => {
    await requireAiContext(user.id, data.schoolId);
    const client = getSupabaseServerClient();

    const payload = {
      school_id: data.schoolId,
      title: data.title,
      content: data.content,
      category: data.category,
      created_by: user.id,
    };

    const { error } = data.id
      ? await client.from('ai_knowledge_articles').update(payload).eq('id', data.id)
      : await client.from('ai_knowledge_articles').insert(payload);

    if (error) {
      throw error;
    }

    revalidateAiPaths();
    return { success: true };
  },
  { schema: UpsertAiKnowledgeSchema },
);

export const deleteAiKnowledgeAction = enhanceAction(
  async (data, user) => {
    await requireAiContext(user.id, data.schoolId);
    const client = getSupabaseServerClient();

    const { error } = await client
      .from('ai_knowledge_articles')
      .update({ is_active: false })
      .eq('id', data.articleId)
      .eq('school_id', data.schoolId);

    if (error) {
      throw error;
    }

    revalidateAiPaths();
    return { success: true };
  },
  { schema: DeleteAiKnowledgeSchema },
);
