'use server';

import { revalidatePath } from 'next/cache';

import { enhanceAction } from '@kit/next/actions';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import pathsConfig from '~/config/paths.config';
import { KINDER_ERROR_CODES, KinderError } from '~/lib/kinder/errors';

import { z } from 'zod';

import { logPlatformAction } from '../platform/audit';
import {
  assertPlatformRole,
  requirePlatformAdmin,
} from '../platform/require-platform-admin';
import { CreateSubscriptionCouponSchema } from './schemas/coupon.schema';
import {
  normalizeCouponCode,
  validateSubscriptionCoupon,
} from './validate-subscription-coupon';
import { syncPercentCouponToStripe } from './stripe-coupon-sync';
import { ValidateSubscriptionCouponSchema } from './schemas/checkout.schema';

function revalidateCouponPaths() {
  revalidatePath(pathsConfig.platform.coupons);
  revalidatePath(pathsConfig.app.settingsSubscription);
}

export const validateSubscriptionCouponAction = enhanceAction(
  async (data, user) => {
    const client = getSupabaseServerClient();

    const { data: member } = await client
      .from('school_members')
      .select('role')
      .eq('school_id', data.schoolId)
      .eq('user_id', user.sub!)
      .is('deleted_at', null)
      .maybeSingle();

    if (member?.role !== 'owner') {
      throw new KinderError(
        KINDER_ERROR_CODES.PERMISSION_DENIED,
        KINDER_ERROR_CODES.PERMISSION_DENIED,
      );
    }

    const { data: pkg } = await client
      .from('packages')
      .select('code')
      .eq('id', data.packageId)
      .single();

    if (!pkg) {
      throw new KinderError(
        KINDER_ERROR_CODES.PACKAGE_NOT_FOUND,
        'Package not found',
      );
    }

    const coupon = await validateSubscriptionCoupon(client, {
      code: data.couponCode,
      schoolId: data.schoolId,
      packageCode: pkg.code,
    });

    return {
      code: coupon.code,
      discountType: coupon.discount_type,
      discountValue: Number(coupon.discount_value),
      description: coupon.description,
    };
  },
  { schema: ValidateSubscriptionCouponSchema },
);

export const platformCreateSubscriptionCouponAction = enhanceAction(
  async (data, user) => {
    const platform = await requirePlatformAdmin(user.sub, ['super_admin', 'billing']);
    assertPlatformRole(platform, ['super_admin', 'billing']);

    const client = getSupabaseServerClient();
    const code = normalizeCouponCode(data.code);

    const { data: existing } = await client
      .from('subscription_coupons')
      .select('id')
      .eq('code', code)
      .maybeSingle();

    if (existing) {
      throw new KinderError(
        KINDER_ERROR_CODES.COUPON_INVALID,
        'Coupon code already exists',
      );
    }

    let stripeCouponId: string | null = null;
    let stripePromotionCodeId: string | null = null;

    if (data.discountType === 'percent_off') {
      const synced = await syncPercentCouponToStripe({
        code,
        description: data.description ?? null,
        discount_value: data.discountValue,
      });
      stripeCouponId = synced.stripeCouponId;
      stripePromotionCodeId = synced.stripePromotionCodeId;
    }

    const { data: coupon, error } = await client
      .from('subscription_coupons')
      .insert({
        code,
        description: data.description || null,
        discount_type: data.discountType,
        discount_value: data.discountValue,
        max_redemptions: data.maxRedemptions ?? null,
        expires_at: data.expiresAt ? new Date(data.expiresAt).toISOString() : null,
        applicable_package_codes: data.applicablePackageCodes ?? [],
        stripe_coupon_id: stripeCouponId,
        stripe_promotion_code_id: stripePromotionCodeId,
        created_by: user.sub,
      })
      .select('id, code')
      .single();

    if (error || !coupon) {
      throw error ?? new Error('Failed to create coupon');
    }

    await logPlatformAction({
      actorUserId: user.sub!,
      action: 'subscription_coupon.create',
      targetType: 'subscription_coupon',
      targetId: coupon.id,
      metadata: { code: coupon.code, discountType: data.discountType },
    });

    revalidateCouponPaths();

    return { success: true, id: coupon.id, code: coupon.code };
  },
  { schema: CreateSubscriptionCouponSchema },
);

export const platformDeactivateSubscriptionCouponAction = enhanceAction(
  async (data, user) => {
    const platform = await requirePlatformAdmin(user.sub, ['super_admin', 'billing']);
    assertPlatformRole(platform, ['super_admin', 'billing']);

    const client = getSupabaseServerClient();

    const { error } = await client
      .from('subscription_coupons')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', data.couponId);

    if (error) {
      throw error;
    }

    await logPlatformAction({
      actorUserId: user.sub!,
      action: 'subscription_coupon.deactivate',
      targetType: 'subscription_coupon',
      targetId: data.couponId,
      metadata: {},
    });

    revalidateCouponPaths();

    return { success: true };
  },
  {
    schema: z.object({
      couponId: z.string().uuid(),
    }),
  },
);
