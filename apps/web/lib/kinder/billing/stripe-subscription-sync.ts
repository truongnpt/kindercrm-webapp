import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';
import type Stripe from 'stripe';

import type { Database } from '~/lib/database.types';
import type { SubscriptionStatus } from '~/lib/kinder/types';

type AdminClient = SupabaseClient<Database>;

export function mapStripeSubscriptionStatus(
  status: Stripe.Subscription.Status,
): SubscriptionStatus {
  switch (status) {
    case 'trialing':
      return 'trial';
    case 'active':
      return 'active';
    case 'past_due':
    case 'unpaid':
      return 'past_due';
    case 'canceled':
    case 'incomplete_expired':
      return 'cancelled';
    default:
      return 'active';
  }
}

export async function findPackageIdByStripePrice(
  client: AdminClient,
  priceId: string,
) {
  const { data: byColumn } = await client
    .from('packages')
    .select('id')
    .eq('stripe_price_id', priceId)
    .maybeSingle();

  if (byColumn?.id) {
    return byColumn.id;
  }

  const { data: byYearlyColumn } = await client
    .from('packages')
    .select('id')
    .eq('stripe_price_yearly_id', priceId)
    .maybeSingle();

  if (byYearlyColumn?.id) {
    return byYearlyColumn.id;
  }

  return null;
}

export async function findFreePackageId(client: AdminClient) {
  const { data } = await client
    .from('packages')
    .select('id')
    .eq('code', 'free')
    .maybeSingle();

  return data?.id ?? null;
}

export async function applyStripeSubscriptionSync(input: {
  client: AdminClient;
  schoolId: string;
  packageId: string;
  status: SubscriptionStatus;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  trialEndsAt: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  changedBy: string | null;
  note: string;
  previousPackageId?: string | null;
  stripeInvoiceId?: string | null;
  stripeInvoiceUrl?: string | null;
}) {
  const { data: currentSub } = await input.client
    .from('school_subscriptions')
    .select('id, package_id, status, past_due_at')
    .eq('school_id', input.schoolId)
    .maybeSingle();

  const previousPackageId =
    input.previousPackageId ?? currentSub?.package_id ?? null;
  const previousStatus = currentSub?.status ?? null;
  const now = new Date().toISOString();
  let pastDueAt = currentSub?.past_due_at ?? null;

  if (input.status === 'past_due') {
    pastDueAt = pastDueAt ?? now;
  } else if (input.status === 'active' || input.status === 'trial') {
    pastDueAt = null;
  }

  const payload = {
    package_id: input.packageId,
    status: input.status,
    stripe_customer_id: input.stripeCustomerId || null,
    stripe_subscription_id: input.stripeSubscriptionId || null,
    trial_ends_at: input.trialEndsAt,
    current_period_start: input.periodStart,
    current_period_end: input.periodEnd,
    past_due_at: pastDueAt,
    updated_at: now,
  };

  if (currentSub) {
    const { error } = await input.client
      .from('school_subscriptions')
      .update(payload)
      .eq('school_id', input.schoolId);

    if (error) {
      throw error;
    }
  } else {
    const { error } = await input.client.from('school_subscriptions').insert({
      school_id: input.schoolId,
      ...payload,
    });

    if (error) {
      throw error;
    }
  }

  if (previousPackageId !== input.packageId || previousStatus !== input.status) {
    await input.client.from('school_subscription_history').insert({
      school_id: input.schoolId,
      package_id: input.packageId,
      previous_package_id: previousPackageId,
      status: input.status,
      changed_by: input.changedBy,
      note: input.note,
      stripe_invoice_id: input.stripeInvoiceId ?? null,
      stripe_invoice_url: input.stripeInvoiceUrl ?? null,
    });
  }
}

export async function syncFromStripeSubscription(
  client: AdminClient,
  subscription: Stripe.Subscription,
  options?: {
    metadata?: Record<string, string>;
    changedBy?: string | null;
    note?: string;
    stripeInvoiceId?: string | null;
    stripeInvoiceUrl?: string | null;
  },
) {
  const metadata = options?.metadata;
  const schoolId = metadata?.school_id ?? subscription.metadata.school_id;

  if (!schoolId) {
    throw new Error('Stripe subscription missing school_id metadata');
  }

  const priceId = subscription.items.data[0]?.price.id;

  if (!priceId) {
    throw new Error('Stripe subscription has no price item');
  }

  const packageId =
    metadata?.package_id ??
    subscription.metadata.package_id ??
    (await findPackageIdByStripePrice(client, priceId));

  if (!packageId) {
    throw new Error(`No package mapped for Stripe price ${priceId}`);
  }

  const status = mapStripeSubscriptionStatus(subscription.status);
  const trialEndsAt = subscription.trial_end
    ? new Date(subscription.trial_end * 1000).toISOString()
    : null;
  const periodStart = (
    subscription as Stripe.Subscription & {
      current_period_start?: number;
      current_period_end?: number;
    }
  ).current_period_start;
  const periodEnd = (
    subscription as Stripe.Subscription & {
      current_period_start?: number;
      current_period_end?: number;
    }
  ).current_period_end;
  const periodStartIso = periodStart
    ? new Date(periodStart * 1000).toISOString()
    : null;
  const periodEndIso = periodEnd
    ? new Date(periodEnd * 1000).toISOString()
    : null;

  await applyStripeSubscriptionSync({
    client,
    schoolId,
    packageId,
    status,
    stripeCustomerId:
      typeof subscription.customer === 'string'
        ? subscription.customer
        : subscription.customer.id,
    stripeSubscriptionId: subscription.id,
    trialEndsAt: status === 'trial' ? trialEndsAt : null,
    periodStart: periodStartIso,
    periodEnd: periodEndIso,
    changedBy: options?.changedBy ?? metadata?.user_id ?? null,
    note: options?.note ?? `Synced from Stripe subscription ${subscription.id}`,
    stripeInvoiceId: options?.stripeInvoiceId ?? null,
    stripeInvoiceUrl: options?.stripeInvoiceUrl ?? null,
  });
}

export async function downgradeSchoolToFree(
  client: AdminClient,
  schoolId: string,
  note: string,
) {
  const freePackageId = await findFreePackageId(client);

  if (!freePackageId) {
    throw new Error('Free package is not configured');
  }

  const { data: currentSub } = await client
    .from('school_subscriptions')
    .select('id, package_id, stripe_customer_id')
    .eq('school_id', schoolId)
    .maybeSingle();

  if (!currentSub) {
    return;
  }

  const now = new Date().toISOString();

  await applyStripeSubscriptionSync({
    client,
    schoolId,
    packageId: freePackageId,
    status: 'active',
    stripeCustomerId: currentSub.stripe_customer_id ?? '',
    stripeSubscriptionId: '',
    trialEndsAt: null,
    periodStart: now,
    periodEnd: null,
    changedBy: null,
    note,
    previousPackageId: currentSub.package_id,
  });
}
