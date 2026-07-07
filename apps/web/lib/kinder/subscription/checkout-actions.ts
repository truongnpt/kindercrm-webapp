import 'server-only';

import type Stripe from 'stripe';

import { revalidatePath } from 'next/cache';

import { enhanceAction } from '@kit/next/actions';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import pathsConfig from '~/config/paths.config';
import { KINDER_ERROR_CODES, KinderError } from '~/lib/kinder/errors';
import type { Package } from '~/lib/kinder/types';

import appConfig from '~/config/app.config';

import {
  isPaidCheckoutPackage,
  isStripeBillingEnabled,
  packageHasCheckoutPrice,
} from '../billing/stripe-config';
import {
  buildCheckoutLineItem,
  buildCheckoutPricingMetadata,
  resolveStripePriceIdOverride,
} from '../billing/stripe-package-pricing';
import { getStripeClient } from '../billing/stripe-server';

import { SubscriptionCheckoutSchema, BillingPortalSchema } from './schemas/checkout.schema';
import {
  buildCheckoutCouponParams,
} from './stripe-coupon-sync';
import {
  normalizeCouponCode,
  validateSubscriptionCoupon,
} from './validate-subscription-coupon';

const SUBSCRIPTION_PATH = pathsConfig.app.settingsSubscription;

async function assertSchoolOwner(schoolId: string, userId: string) {
  const client = getSupabaseServerClient();

  const { data: member, error } = await client
    .from('school_members')
    .select('role')
    .eq('school_id', schoolId)
    .eq('user_id', userId)
    .is('deleted_at', null)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (member?.role !== 'owner') {
    throw new KinderError(
      KINDER_ERROR_CODES.PERMISSION_DENIED,
      KINDER_ERROR_CODES.PERMISSION_DENIED,
    );
  }
}

/** SUB-001: Create Stripe Checkout session for a paid plan. */
export const createSubscriptionCheckoutAction = enhanceAction(
  async (data, user) => {
    if (!isStripeBillingEnabled()) {
      throw new KinderError(
        KINDER_ERROR_CODES.PACKAGE_NOT_AVAILABLE,
        'Stripe billing is not configured',
      );
    }

    await assertSchoolOwner(data.schoolId, user.sub!);

    const client = getSupabaseServerClient();
    const stripe = getStripeClient();

    const { data: pkg, error: packageError } = await client
      .from('packages')
      .select('*')
      .eq('id', data.packageId)
      .eq('is_active', true)
      .single();

    if (packageError || !pkg) {
      throw new KinderError(
        KINDER_ERROR_CODES.PACKAGE_NOT_FOUND,
        'Package not found',
      );
    }

    const packageRow = pkg as Package;

    if (!isPaidCheckoutPackage(packageRow)) {
      throw new KinderError(
        KINDER_ERROR_CODES.PACKAGE_NOT_AVAILABLE,
        'This package does not require checkout',
      );
    }

    const billingInterval = data.billingInterval ?? 'monthly';

    if (!packageHasCheckoutPrice(packageRow, billingInterval)) {
      throw new KinderError(
        KINDER_ERROR_CODES.PACKAGE_NOT_AVAILABLE,
        billingInterval === 'yearly'
          ? 'Yearly price is not configured for this package'
          : 'Monthly price is not configured for this package',
      );
    }

    const lineItem = buildCheckoutLineItem(packageRow, billingInterval);
    const pricingMetadata = resolveStripePriceIdOverride(packageRow, billingInterval)
      ? {}
      : buildCheckoutPricingMetadata(packageRow, billingInterval);

    const { data: school } = await client
      .from('schools')
      .select('id, name, email')
      .eq('id', data.schoolId)
      .single();

    const { data: subscription } = await client
      .from('school_subscriptions')
      .select('stripe_customer_id')
      .eq('school_id', data.schoolId)
      .maybeSingle();

    let customerId = subscription?.stripe_customer_id ?? undefined;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? school?.email ?? undefined,
        name: school?.name ?? undefined,
        metadata: {
          school_id: data.schoolId,
        },
      });

      customerId = customer.id;

      if (subscription) {
        await client
          .from('school_subscriptions')
          .update({ stripe_customer_id: customerId })
          .eq('school_id', data.schoolId);
      }
    }

    if (!customerId) {
      throw new Error('Stripe customer was not created');
    }

    const siteUrl = appConfig.url.replace(/\/$/, '');
    const successUrl = `${siteUrl}${SUBSCRIPTION_PATH}?checkout=success`;
    const cancelUrl = `${siteUrl}${SUBSCRIPTION_PATH}?checkout=cancelled`;

    let coupon:
      | Awaited<ReturnType<typeof validateSubscriptionCoupon>>
      | null = null;

    if (data.couponCode) {
      coupon = await validateSubscriptionCoupon(client, {
        code: data.couponCode,
        schoolId: data.schoolId,
        packageCode: packageRow.code,
      });
    }

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      customer: customerId,
      line_items: [lineItem],
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: data.schoolId,
      metadata: {
        school_id: data.schoolId,
        package_id: data.packageId,
        user_id: user.sub!,
        billing_interval: billingInterval,
        ...pricingMetadata,
        ...(coupon
          ? { coupon_id: coupon.id, coupon_code: normalizeCouponCode(coupon.code) }
          : {}),
      },
      subscription_data: {
        metadata: {
          school_id: data.schoolId,
          package_id: data.packageId,
          billing_interval: billingInterval,
          ...pricingMetadata,
          ...(coupon
            ? { coupon_id: coupon.id, coupon_code: normalizeCouponCode(coupon.code) }
            : {}),
        },
      },
      allow_promotion_codes: !coupon,
    };

    if (coupon) {
      const couponParams = buildCheckoutCouponParams(coupon);
      Object.assign(sessionParams, couponParams);

      if (couponParams.subscription_data) {
        sessionParams.subscription_data = {
          ...sessionParams.subscription_data,
          ...couponParams.subscription_data,
          metadata: {
            ...sessionParams.subscription_data?.metadata,
            ...couponParams.subscription_data.metadata,
          },
        };
      }
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    if (!session.url) {
      throw new Error('Failed to create Stripe Checkout session');
    }

    return { url: session.url };
  },
  { schema: SubscriptionCheckoutSchema },
);

/** Open Stripe Customer Portal for subscription management. */
export const createBillingPortalAction = enhanceAction(
  async (data, user) => {
    if (!isStripeBillingEnabled()) {
      throw new KinderError(
        KINDER_ERROR_CODES.PACKAGE_NOT_AVAILABLE,
        KINDER_ERROR_CODES.PACKAGE_NOT_AVAILABLE,
      );
    }

    await assertSchoolOwner(data.schoolId, user.sub!);

    const client = getSupabaseServerClient();
    const stripe = getStripeClient();

    const { data: subscription, error } = await client
      .from('school_subscriptions')
      .select('stripe_customer_id, status')
      .eq('school_id', data.schoolId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!subscription?.stripe_customer_id) {
      throw new KinderError(
        KINDER_ERROR_CODES.SUBSCRIPTION_NOT_FOUND,
        KINDER_ERROR_CODES.SUBSCRIPTION_NOT_FOUND,
      );
    }

    const siteUrl = appConfig.url.replace(/\/$/, '');
    const returnUrl = `${siteUrl}${SUBSCRIPTION_PATH}`;

    const intent =
      data.intent ??
      (subscription.status === 'past_due' ? 'payment_method_update' : 'default');

    const portal = await stripe.billingPortal.sessions.create(
      intent === 'payment_method_update'
        ? {
            customer: subscription.stripe_customer_id,
            return_url: returnUrl,
            flow_data: {
              type: 'payment_method_update',
              after_completion: {
                type: 'redirect',
                redirect: { return_url: returnUrl },
              },
            },
          }
        : {
            customer: subscription.stripe_customer_id,
            return_url: returnUrl,
          },
    );

    return { url: portal.url };
  },
  { schema: BillingPortalSchema },
);

export function revalidateSubscriptionBillingPaths(schoolId?: string) {
  revalidatePath(pathsConfig.app.home);
  revalidatePath(SUBSCRIPTION_PATH);

  if (schoolId) {
    revalidatePath(`${pathsConfig.platform.schoolDetail}/${schoolId}`);
  }
}
