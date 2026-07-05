import { getSupabaseServerClient } from '@kit/supabase/server-client';

type PaymentTableClient = {
  from(table: string): ReturnType<ReturnType<typeof getSupabaseServerClient>['from']>;
};

export function getPaymentDbClient() {
  return getSupabaseServerClient() as unknown as PaymentTableClient;
}
