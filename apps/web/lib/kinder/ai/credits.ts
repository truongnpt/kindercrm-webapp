import 'server-only';

import { getSupabaseServerClient } from '@kit/supabase/server-client';

import { getPackageLimits } from '~/lib/kinder/subscription/quotas';
import type { Package } from '~/lib/kinder/types';

import { estimateCredits } from './config';
import type { AiActionType } from './types';

function currentUsageMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
}

export async function getAiCreditStatus(schoolId: string, pkg: Package | null) {
  const client = getSupabaseServerClient();
  const usageMonth = currentUsageMonth();
  const limits = getPackageLimits(pkg);

  const { data, error } = await client
    .from('ai_credit_usage')
    .select('*')
    .eq('school_id', schoolId)
    .eq('usage_month', usageMonth)
    .maybeSingle();

  if (error) {
    throw error;
  }

  const creditsUsed = data?.credits_used ?? 0;
  const creditsLimit = data?.credits_limit || limits.aiCreditsMonthly;

  return {
    usageMonth,
    creditsUsed,
    creditsLimit,
    creditsRemaining: Math.max(0, creditsLimit - creditsUsed),
  };
}

export async function consumeAiCredits(input: {
  schoolId: string;
  pkg: Package | null;
  credits: number;
  actionType: AiActionType;
}) {
  const client = getSupabaseServerClient();
  const usageMonth = currentUsageMonth();
  const limits = getPackageLimits(input.pkg);
  const status = await getAiCreditStatus(input.schoolId, input.pkg);

  if (status.creditsLimit <= 0) {
    throw new Error('Gói hiện tại không có AI credits');
  }

  if (status.creditsRemaining < input.credits) {
    throw new Error('Đã hết AI credits trong tháng này');
  }

  const nextUsed = status.creditsUsed + input.credits;

  const { error } = await client.from('ai_credit_usage').upsert(
    {
      school_id: input.schoolId,
      usage_month: usageMonth,
      credits_used: nextUsed,
      credits_limit: status.creditsLimit || limits.aiCreditsMonthly,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'school_id,usage_month' },
  );

  if (error) {
    throw error;
  }

  return {
    creditsUsed: nextUsed,
    creditsRemaining: Math.max(0, status.creditsLimit - nextUsed),
    actionType: input.actionType,
  };
}

export function creditsForText(text: string) {
  return estimateCredits(text);
}
