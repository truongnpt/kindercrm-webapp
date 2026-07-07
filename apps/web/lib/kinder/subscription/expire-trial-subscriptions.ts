import 'server-only';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

export type ExpiredTrialRow = {
  school_id: string;
  subscription_id: string;
};

/** SUB-003: Process all trial subscriptions past trial_ends_at. */
export async function expireTrialSubscriptions() {
  const client = getSupabaseServerAdminClient();

  const { data, error } = await client.rpc('expire_expired_trial_subscriptions');

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as ExpiredTrialRow[];

  return {
    processed: rows.length,
    schoolIds: rows.map((row) => row.school_id),
    rows,
  };
}
