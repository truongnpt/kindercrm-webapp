import { convertVndToUsdCents } from './vnd-usd-exchange';

export function formatVnd(amount: number) {
  if (amount <= 0) {
    return 'Miễn phí';
  }

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatUsdFromCents(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

/** Approximate USD charge shown next to VND list prices (Stripe checkout). */
export function formatVndAsUsdCheckout(
  vndAmount: number,
  vndPerUsd: number,
): string | null {
  if (vndAmount <= 0 || !Number.isFinite(vndPerUsd) || vndPerUsd <= 0) {
    return null;
  }

  const cents = convertVndToUsdCents(vndAmount, vndPerUsd);
  return formatUsdFromCents(cents);
}
