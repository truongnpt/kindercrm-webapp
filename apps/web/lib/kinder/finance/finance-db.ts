import { getSupabaseServerClient } from '@kit/supabase/server-client';

type FinanceExtensionClient = {
  from(table: string): ReturnType<ReturnType<typeof getSupabaseServerClient>['from']>;
};

export function getFinanceExtensionClient() {
  return getSupabaseServerClient() as unknown as FinanceExtensionClient;
}
