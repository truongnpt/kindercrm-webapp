import 'server-only';

import { getPlatformDataClient } from './platform-data-client';
import type { SubscriptionCouponRow } from '../subscription/validate-subscription-coupon';

export async function loadPlatformSubscriptionCoupons(): Promise<
  SubscriptionCouponRow[]
> {
  const client = getPlatformDataClient();

  const { data, error } = await client
    .from('subscription_coupons')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as SubscriptionCouponRow[];
}
