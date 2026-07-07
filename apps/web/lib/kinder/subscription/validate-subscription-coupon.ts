import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '~/lib/database.types';
import { KINDER_ERROR_CODES, KinderError } from '~/lib/kinder/errors';

export type SubscriptionCouponDiscountType = 'percent_off' | 'free_months';

export type SubscriptionCouponRow = {
  id: string;
  code: string;
  description: string | null;
  discount_type: SubscriptionCouponDiscountType;
  discount_value: number;
  max_redemptions: number | null;
  redemption_count: number;
  expires_at: string | null;
  is_active: boolean;
  applicable_package_codes: string[];
  stripe_coupon_id: string | null;
  stripe_promotion_code_id: string | null;
};

export function normalizeCouponCode(code: string) {
  return code.trim().toUpperCase();
}

function packageEligible(
  coupon: SubscriptionCouponRow,
  packageCode: string,
) {
  if (!coupon.applicable_package_codes.length) {
    return true;
  }

  return coupon.applicable_package_codes.includes(packageCode);
}

export async function loadSubscriptionCouponByCode(
  client: SupabaseClient<Database>,
  code: string,
) {
  const normalized = normalizeCouponCode(code);

  const { data, error } = await client
    .from('subscription_coupons')
    .select('*')
    .eq('code', normalized)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as SubscriptionCouponRow | null) ?? null;
}

export async function validateSubscriptionCoupon(
  client: SupabaseClient<Database>,
  input: {
    code: string;
    schoolId: string;
    packageCode: string;
  },
) {
  const coupon = await loadSubscriptionCouponByCode(client, input.code);

  if (!coupon || !coupon.is_active) {
    throw new KinderError(
      KINDER_ERROR_CODES.COUPON_INVALID,
      KINDER_ERROR_CODES.COUPON_INVALID,
    );
  }

  if (coupon.expires_at && new Date(coupon.expires_at) <= new Date()) {
    throw new KinderError(
      KINDER_ERROR_CODES.COUPON_INVALID,
      KINDER_ERROR_CODES.COUPON_INVALID,
    );
  }

  if (
    coupon.max_redemptions !== null &&
    coupon.redemption_count >= coupon.max_redemptions
  ) {
    throw new KinderError(
      KINDER_ERROR_CODES.COUPON_INVALID,
      KINDER_ERROR_CODES.COUPON_INVALID,
    );
  }

  if (!packageEligible(coupon, input.packageCode)) {
    throw new KinderError(
      KINDER_ERROR_CODES.COUPON_INVALID,
      KINDER_ERROR_CODES.COUPON_INVALID,
    );
  }

  const { data: existingRedemption } = await client
    .from('subscription_coupon_redemptions')
    .select('id')
    .eq('coupon_id', coupon.id)
    .eq('school_id', input.schoolId)
    .maybeSingle();

  if (existingRedemption) {
    throw new KinderError(
      KINDER_ERROR_CODES.COUPON_INVALID,
      KINDER_ERROR_CODES.COUPON_INVALID,
    );
  }

  return coupon;
}

export async function recordSubscriptionCouponRedemption(
  client: SupabaseClient<Database>,
  input: {
    couponId: string;
    schoolId: string;
    stripeCheckoutSessionId?: string | null;
  },
) {
  const { error: redemptionError } = await client
    .from('subscription_coupon_redemptions')
    .insert({
      coupon_id: input.couponId,
      school_id: input.schoolId,
      stripe_checkout_session_id: input.stripeCheckoutSessionId ?? null,
    });

  if (redemptionError?.code === '23505') {
    return;
  }

  if (redemptionError) {
    throw redemptionError;
  }

  const { data: coupon, error: loadError } = await client
    .from('subscription_coupons')
    .select('redemption_count')
    .eq('id', input.couponId)
    .single();

  if (loadError || !coupon) {
    throw loadError ?? new Error('Coupon not found');
  }

  const { error: updateError } = await client
    .from('subscription_coupons')
    .update({
      redemption_count: coupon.redemption_count + 1,
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.couponId);

  if (updateError) {
    throw updateError;
  }
}
