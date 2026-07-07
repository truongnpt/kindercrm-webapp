import type { Package } from '~/lib/kinder/types';

import { isPaidCheckoutPackage } from './stripe-billing-shared';
import {
  getPackageBillingAmount,
  packageHasYearlyBillingFromDb,
  resolveStripePriceIdOverride,
} from './stripe-package-pricing';

export { isPaidCheckoutPackage } from './stripe-billing-shared';

export function isStripeBillingEnabled() {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}

export function getStripeWebhookSecret() {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();

  if (!secret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
  }

  return secret;
}

type PackageBillingFields = Pick<
  Package,
  | 'code'
  | 'price_monthly'
  | 'price_yearly'
  | 'stripe_price_id'
  | 'stripe_price_yearly_id'
>;

/** @deprecated Use getPackageBillingAmount / buildCheckoutLineItem — env fallback removed. */
export function resolveStripePriceId(
  pkg: Pick<Package, 'code' | 'stripe_price_id' | 'stripe_price_yearly_id'>,
  interval: 'monthly' | 'yearly' = 'monthly',
) {
  return resolveStripePriceIdOverride(pkg, interval);
}

export function packageHasYearlyStripePrice(pkg: PackageBillingFields) {
  if (resolveStripePriceIdOverride(pkg, 'yearly')) {
    return true;
  }

  return packageHasYearlyBillingFromDb(pkg);
}

export function anyPackageHasYearlyBilling(
  packages: PackageBillingFields[],
) {
  return packages.some(
    (pkg) => isPaidCheckoutPackage(pkg) && packageHasYearlyStripePrice(pkg),
  );
}

export function packageHasCheckoutPrice(
  pkg: PackageBillingFields,
  interval: 'monthly' | 'yearly' = 'monthly',
) {
  if (resolveStripePriceIdOverride(pkg, interval)) {
    return true;
  }

  return getPackageBillingAmount(pkg, interval) !== null;
}
