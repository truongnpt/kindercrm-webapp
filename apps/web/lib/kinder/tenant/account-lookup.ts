import 'server-only';

import { getSupabaseServerClient } from '@kit/supabase/server-client';

export type AccountSummary = {
  id: string;
  email: string | null;
  name: string;
};

export async function findAccountByEmailForSchool(
  schoolId: string,
  email: string,
): Promise<AccountSummary | null> {
  const client = getSupabaseServerClient();

  const { data, error } = await client.rpc('find_account_by_email_for_school', {
    p_school_id: schoolId,
    p_email: email,
  });

  if (error) {
    throw error;
  }

  const rows = data ?? [];
  return rows[0] ?? null;
}

export async function getSchoolMemberAccounts(
  schoolId: string,
  userIds?: string[],
): Promise<AccountSummary[]> {
  const client = getSupabaseServerClient();

  const { data, error } = await client.rpc('get_school_member_accounts', {
    p_school_id: schoolId,
    p_user_ids: userIds?.length ? userIds : undefined,
  });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function isSchoolSlugAvailable(slug: string): Promise<boolean> {
  const client = getSupabaseServerClient();

  const { data, error } = await client.rpc('is_school_slug_available', {
    p_slug: slug,
  });

  if (error) {
    throw error;
  }

  return data === true;
}
