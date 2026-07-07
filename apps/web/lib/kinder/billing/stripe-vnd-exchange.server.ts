import 'server-only';

const DEFAULT_VND_PER_USD = 25_000;

export function getStripeVndPerUsd(): number {
  const raw = process.env.STRIPE_VND_PER_USD?.trim();
  const rate = raw ? Number(raw) : DEFAULT_VND_PER_USD;

  if (!Number.isFinite(rate) || rate <= 0) {
    throw new Error(
      'STRIPE_VND_PER_USD must be a positive number (VND per 1 USD)',
    );
  }

  return rate;
}
