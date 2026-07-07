import type { Package } from '~/lib/kinder/types';

export type SubscriptionBillingInterval = 'monthly' | 'yearly';

export function getPackageDisplayPrice(
  pkg: Pick<Package, 'price_monthly' | 'price_yearly'>,
  interval: SubscriptionBillingInterval,
) {
  if (interval === 'yearly') {
    if ((pkg.price_yearly ?? 0) > 0) {
      return pkg.price_yearly!;
    }

    return pkg.price_monthly * 12;
  }

  return pkg.price_monthly;
}

export function getYearlyMonthlyEquivalent(
  pkg: Pick<Package, 'price_monthly' | 'price_yearly'>,
) {
  const yearly = getPackageDisplayPrice(pkg, 'yearly');

  if (yearly <= 0) {
    return 0;
  }

  return Math.round(yearly / 12);
}

export function getYearlySavingsPercent(
  pkg: Pick<Package, 'price_monthly' | 'price_yearly'>,
) {
  if (pkg.price_monthly <= 0) {
    return 0;
  }

  const yearly = getPackageDisplayPrice(pkg, 'yearly');
  const fullYear = pkg.price_monthly * 12;

  if (yearly >= fullYear) {
    return 0;
  }

  return Math.round((1 - yearly / fullYear) * 100);
}

export function packageSupportsYearlyCheckout(
  pkg: Pick<
    Package,
    'price_monthly' | 'price_yearly' | 'code' | 'stripe_price_yearly_id'
  >,
) {
  return (
    pkg.price_monthly > 0 &&
    isFixedPackageCode(pkg.code) &&
    ((pkg.price_yearly ?? 0) > 0 || Boolean(pkg.stripe_price_yearly_id?.trim()))
  );
}
