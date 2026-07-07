/** Minimum Stripe charge for USD subscriptions (50¢). */
export const STRIPE_USD_MIN_CENTS = 50;

export function convertVndToUsdCents(
  vndAmount: number,
  vndPerUsd: number,
): number {
  if (vndAmount <= 0) {
    return 0;
  }

  if (!Number.isFinite(vndPerUsd) || vndPerUsd <= 0) {
    throw new Error('vndPerUsd must be a positive number');
  }

  const usd = vndAmount / vndPerUsd;
  const cents = Math.round(usd * 100);

  return Math.max(cents, STRIPE_USD_MIN_CENTS);
}

export function convertUsdCentsToVnd(
  usdCents: number,
  vndPerUsd: number,
): number {
  if (!Number.isFinite(vndPerUsd) || vndPerUsd <= 0) {
    throw new Error('vndPerUsd must be a positive number');
  }

  return Math.round((usdCents / 100) * vndPerUsd);
}

export function resolveVndPerUsdFromMetadata(
  metadata: Record<string, string | undefined> | null | undefined,
  fallbackRate: number,
): number {
  const raw = metadata?.vnd_per_usd?.trim();
  const parsed = raw ? Number(raw) : NaN;

  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed;
  }

  return fallbackRate;
}
