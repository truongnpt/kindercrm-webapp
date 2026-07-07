import 'server-only';

import type Stripe from 'stripe';

import type { Package } from '~/lib/kinder/types';
import type { SubscriptionBillingInterval } from '~/lib/kinder/subscription/subscription-billing-interval';

import { convertVndToUsdCents } from './vnd-usd-exchange';
import { getStripeVndPerUsd } from './stripe-vnd-exchange.server';

const STRIPE_CURRENCY = 'usd';

export type CheckoutPricing = {
  vndAmount: number;
  usdCents: number;
  vndPerUsd: number;
};

export function getPackageBillingAmount(
  pkg: Pick<Package, 'price_monthly' | 'price_yearly'>,
  interval: SubscriptionBillingInterval,
): number | null {
  if (interval === 'yearly') {
    const yearly = pkg.price_yearly ?? 0;
    return yearly > 0 ? yearly : null;
  }

  return pkg.price_monthly > 0 ? pkg.price_monthly : null;
}

export function packageHasYearlyBillingFromDb(
  pkg: Pick<Package, 'price_monthly' | 'price_yearly' | 'code'>,
) {
  return getPackageBillingAmount(pkg, 'yearly') !== null;
}

export function resolveCheckoutPricing(
  pkg: Pick<Package, 'price_monthly' | 'price_yearly' | 'code'>,
  interval: SubscriptionBillingInterval,
): CheckoutPricing {
  const vndAmount = getPackageBillingAmount(pkg, interval);

  if (vndAmount === null) {
    throw new Error(`Package ${pkg.code} has no ${interval} price configured`);
  }

  const vndPerUsd = getStripeVndPerUsd();
  const usdCents = convertVndToUsdCents(vndAmount, vndPerUsd);

  return { vndAmount, usdCents, vndPerUsd };
}

function formatVndLabel(amount: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function buildStripeCheckoutLineItem(
  pkg: Package,
  interval: SubscriptionBillingInterval,
): Stripe.Checkout.SessionCreateParams.LineItem {
  const pricing = resolveCheckoutPricing(pkg, interval);

  return {
    quantity: 1,
    price_data: {
      currency: STRIPE_CURRENCY,
      unit_amount: pricing.usdCents,
      recurring: {
        interval: interval === 'yearly' ? 'year' : 'month',
      },
      product_data: {
        name: `${pkg.name} — Kinder CRM`,
        description: `${formatVndLabel(pricing.vndAmount)} (quy đổi USD)`,
        metadata: {
          package_code: pkg.code,
          package_id: pkg.id,
          billing_interval: interval,
          price_vnd: String(pricing.vndAmount),
          vnd_per_usd: String(pricing.vndPerUsd),
        },
      },
    },
  };
}

export function buildCheckoutPricingMetadata(
  pkg: Package,
  interval: SubscriptionBillingInterval,
): Record<string, string> {
  const pricing = resolveCheckoutPricing(pkg, interval);

  return {
    price_vnd: String(pricing.vndAmount),
    vnd_per_usd: String(pricing.vndPerUsd),
    usd_cents: String(pricing.usdCents),
    billing_interval: interval,
    package_code: pkg.code,
  };
}

/** Optional Platform override: use a pre-created Stripe Price when configured. */
export function resolveStripePriceIdOverride(
  pkg: Pick<Package, 'stripe_price_id' | 'stripe_price_yearly_id'>,
  interval: SubscriptionBillingInterval,
): string | null {
  if (interval === 'yearly') {
    return pkg.stripe_price_yearly_id?.trim() || null;
  }

  return pkg.stripe_price_id?.trim() || null;
}

export function buildCheckoutLineItem(
  pkg: Package,
  interval: SubscriptionBillingInterval,
): Stripe.Checkout.SessionCreateParams.LineItem {
  const priceIdOverride = resolveStripePriceIdOverride(pkg, interval);

  if (priceIdOverride) {
    return {
      price: priceIdOverride,
      quantity: 1,
    };
  }

  return buildStripeCheckoutLineItem(pkg, interval);
}
