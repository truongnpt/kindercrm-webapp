import 'server-only';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

import type { AccountSummary } from '~/lib/kinder/tenant/account-lookup';

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function findAccountByEmail(
  email: string,
): Promise<AccountSummary | null> {
  const normalizedEmail = normalizeEmail(email);
  const admin = getSupabaseServerAdminClient();

  const { data, error } = await admin
    .from('accounts')
    .select('id, email, name')
    .ilike('email', normalizedEmail)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (data) {
    return {
      id: data.id,
      email: data.email,
      name: data.name,
    };
  }

  return null;
}
