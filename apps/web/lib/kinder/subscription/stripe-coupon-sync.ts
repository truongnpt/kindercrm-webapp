import type Stripe from 'stripe';

import { isStripeBillingEnabled } from '../billing/stripe-config';
import { getStripeClient } from '../billing/stripe-server';

import {
  normalizeCouponCode,
  type SubscriptionCouponRow,
} from './validate-subscription-coupon';

export async function syncPercentCouponToStripe(coupon: {
  code: string;
  description: string | null;
  discount_value: number;
}) {
  if (!isStripeBillingEnabled()) {
    return {
      stripeCouponId: null as string | null,
      stripePromotionCodeId: null as string | null,
    };
  }

  const stripe = getStripeClient();
  const code = normalizeCouponCode(coupon.code);

  const stripeCoupon = await stripe.coupons.create({
    name: coupon.description ?? code,
    percent_off: coupon.discount_value,
    duration: 'once',
  });

  const promotionCode = await stripe.promotionCodes.create({
    coupon: stripeCoupon.id,
    code,
    active: true,
  });

  return {
    stripeCouponId: stripeCoupon.id,
    stripePromotionCodeId: promotionCode.id,
  };
}

export function buildCheckoutCouponParams(
  coupon: SubscriptionCouponRow,
): Pick<
  Stripe.Checkout.SessionCreateParams,
  'discounts' | 'allow_promotion_codes' | 'subscription_data'
> {
  if (coupon.discount_type === 'percent_off') {
    if (!coupon.stripe_promotion_code_id) {
      throw new Error('Coupon is missing Stripe promotion code');
    }

    return {
      discounts: [{ promotion_code: coupon.stripe_promotion_code_id }],
      allow_promotion_codes: false,
    };
  }

  const freeMonths = Math.round(coupon.discount_value);

  return {
    allow_promotion_codes: false,
    subscription_data: {
      trial_period_days: freeMonths * 30,
    },
  };
}
