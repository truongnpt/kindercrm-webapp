import 'server-only';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

import type { TrialReminderKind } from './package-features';

export type TrialSubscriptionRow = {
  school_id: string;
  trial_ends_at: string;
  school: { id: string; name: string } | null;
};

export function trialReminderReferenceType(kind: TrialReminderKind) {
  return `trial_reminder_${kind}`;
}

export const TRIAL_IN_APP_COPY: Record<
  TrialReminderKind,
  { title: string; body: string }
> = {
  t7: {
    title: 'Còn 7 ngày dùng thử',
    body: 'Nâng cấp gói để tiếp tục dùng đầy đủ tính năng sau khi hết hạn.',
  },
  t3: {
    title: 'Còn 3 ngày dùng thử',
    body: 'Chọn gói phù hợp trước khi trial kết thúc.',
  },
  t1: {
    title: 'Ngày mai hết hạn dùng thử',
    body: 'Nâng cấp hôm nay để không bị gián đoạn.',
  },
  expired: {
    title: 'Hôm nay là ngày cuối dùng thử',
    body: 'Nâng cấp ngay để giữ quyền truy cập đầy đủ tính năng.',
  },
};

export async function loadActiveTrialSubscriptions() {
  const client = getSupabaseServerAdminClient();

  const { data, error } = await client
    .from('school_subscriptions')
    .select(
      `
      school_id,
      trial_ends_at,
      status,
      school:schools (
        id,
        name
      )
    `,
    )
    .eq('status', 'trial')
    .not('trial_ends_at', 'is', null);

  if (error) {
    throw error;
  }

  return (data ?? []) as TrialSubscriptionRow[];
}

export async function loadSchoolOwner(schoolId: string) {
  const client = getSupabaseServerAdminClient();

  const { data: member, error: memberError } = await client
    .from('school_members')
    .select('user_id')
    .eq('school_id', schoolId)
    .eq('role', 'owner')
    .is('deleted_at', null)
    .maybeSingle();

  if (memberError) {
    throw memberError;
  }

  if (!member?.user_id) {
    return null;
  }

  const { data: account, error: accountError } = await client
    .from('accounts')
    .select('email, name')
    .eq('id', member.user_id)
    .maybeSingle();

  if (accountError) {
    throw accountError;
  }

  return {
    userId: member.user_id,
    email: account?.email ?? null,
    name: account?.name ?? null,
  };
}
