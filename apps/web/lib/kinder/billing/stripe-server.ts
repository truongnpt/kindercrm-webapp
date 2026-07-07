import Stripe from 'stripe';

import { isStripeBillingEnabled } from './stripe-config';

let stripeClient: Stripe | null = null;

export function getStripeClient() {
  if (!isStripeBillingEnabled()) {
    throw new Error('Stripe billing is not configured (missing STRIPE_SECRET_KEY)');
  }

  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }

  return stripeClient;
}
