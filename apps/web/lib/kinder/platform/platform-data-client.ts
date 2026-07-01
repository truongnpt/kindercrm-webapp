import 'server-only';

import { getSupabaseServerClient } from '@kit/supabase/server-client';

/**
 * Supabase client for platform console operations under RLS.
 * Callers must verify platform admin access before use.
 */
export function getPlatformDataClient() {
  return getSupabaseServerClient();
}

/** @alias getPlatformDataClient */
export const getPlatformMutationClient = getPlatformDataClient;
