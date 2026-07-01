import 'server-only';

import { getAiConfig } from './config';
import type { AiCompletionMessage } from './types';

const SYSTEM_PROMPT_VI = `Bạn là trợ lý AI của Kinder CRM — nền tảng quản lý trường mầm non tại Việt Nam.
Trả lời ngắn gọn, thực tế, bằng tiếng Việt. Tập trung hỗ trợ giáo viên và quản lý nhà trường.
Không đưa ra lời khuyên y tế chẩn đoán. Khi thiếu dữ liệu, nói rõ và gợi ý bước tiếp theo.`;

export async function completeAiChat(input: {
  messages: AiCompletionMessage[];
  knowledgeSnippets?: string[];
  schoolContext?: string;
  maxTokens?: number;
}) {
  const config = getAiConfig();

  if (!config.isConfigured) {
    return {
      content: buildFallbackReply(input.messages),
      creditsUsed: 1,
      provider: 'fallback' as const,
    };
  }

  const knowledgeBlock =
    input.knowledgeSnippets && input.knowledgeSnippets.length > 0
      ? `\n\nKiến thức nội bộ:\n${input.knowledgeSnippets.join('\n---\n')}`
      : '';
  const contextBlock = input.schoolContext
    ? `\n\nDữ liệu trường:\n${input.schoolContext}`
    : '';

  const systemContent = `${SYSTEM_PROMPT_VI}${contextBlock}${knowledgeBlock}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: 'system', content: systemContent },
        ...input.messages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
      ],
      max_tokens: input.maxTokens ?? 800,
      temperature: 0.4,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI provider error: ${errorText.slice(0, 200)}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    usage?: { total_tokens?: number };
  };

  const content =
    payload.choices?.[0]?.message?.content?.trim() ||
    'Xin lỗi, tôi không thể tạo phản hồi lúc này.';

  const creditsUsed = Math.max(
    1,
    Math.ceil((payload.usage?.total_tokens ?? content.length / 4) / 50),
  );

  return {
    content,
    creditsUsed,
    provider: 'openai' as const,
  };
}

function buildFallbackReply(messages: AiCompletionMessage[]) {
  const lastUser = [...messages].reverse().find((m) => m.role === 'user');

  if (!lastUser) {
    return 'Xin chào! Tôi là trợ lý Kinder CRM. Hãy cấu hình OPENAI_API_KEY để dùng AI đầy đủ, hoặc hỏi về điểm danh, nhật ký, thực đơn và kho.';
  }

  const text = lastUser.content.toLowerCase();

  if (text.includes('nhật ký') || text.includes('daily')) {
    return 'Bạn có thể ghi nhật ký tại Nhật ký → chọn lớp → mở từng học sinh. Dùng nút "Gợi ý AI" để soạn nhanh ghi chú giáo viên.';
  }

  if (text.includes('điểm danh') || text.includes('attendance')) {
    return 'Vào Điểm danh → chọn lớp và ngày để check-in/out hoặc điểm danh hàng loạt. Tab Báo cáo xem tỷ lệ theo tháng.';
  }

  if (text.includes('học phí') || text.includes('doanh thu')) {
    return 'Xem Tài chính → Tổng quan và Công nợ. Tab Hóa đơn để tạo và ghi nhận thanh toán.';
  }

  return 'Trợ lý AI đang ở chế độ cơ bản (chưa cấu hình OPENAI_API_KEY). Bạn vẫn có thể dùng Gợi ý AI trong nhật ký và tab Thông tin chi tiết trên trang AI.';
}

export async function generateAiText(input: {
  prompt: string;
  schoolContext?: string;
  maxTokens?: number;
}) {
  return completeAiChat({
    messages: [{ role: 'user', content: input.prompt }],
    schoolContext: input.schoolContext,
    maxTokens: input.maxTokens ?? 400,
  });
}
