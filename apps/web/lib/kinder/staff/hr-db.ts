import { getSupabaseServerClient } from '@kit/supabase/server-client';

type HrTableClient = {
  from(table: string): ReturnType<ReturnType<typeof getSupabaseServerClient>['from']>;
};

export function getHrDbClient() {
  return getSupabaseServerClient() as unknown as HrTableClient;
}
