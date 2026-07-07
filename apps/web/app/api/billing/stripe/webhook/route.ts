import { NextResponse } from 'next/server';
import type Stripe from 'stripe';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

import { getStripeWebhookSecret } from '~/lib/kinder/billing/stripe-config';
import { getStripeClient } from '~/lib/kinder/billing/stripe-server';
import {
  downgradeSchoolToFree,
  syncFromStripeSubscription,
} from '~/lib/kinder/billing/stripe-subscription-sync';
import { issueSaasInvoiceFromStripe } from '~/lib/kinder/subscription/issue-saas-invoice';
import { revalidateSubscriptionBillingPaths } from '~/lib/kinder/subscription/subscription-billing-revalidate.server';
import { recordSubscriptionCouponRedemption } from '~/lib/kinder/subscription/validate-subscription-coupon';

export const runtime = 'nodejs';

async function markEventProcessed(eventId: string, eventType: string) {
  const client = getSupabaseServerAdminClient();

  const { error } = await client.from('stripe_webhook_events').insert({
    id: eventId,
    event_type: eventType,
  });

  if (error?.code === '23505') {
    return false;
  }

  if (error) {
    throw error;
  }

  return true;
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (session.mode !== 'subscription' || !session.subscription) {
    return;
  }

  const stripe = getStripeClient();
  const subscriptionId =
    typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription.id;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const client = getSupabaseServerAdminClient();

  let stripeInvoiceId: string | null = null;
  let stripeInvoiceUrl: string | null = null;

  if (session.invoice) {
    const invoiceId =
      typeof session.invoice === 'string'
        ? session.invoice
        : (session.invoice.id ?? null);

    if (invoiceId) {
      try {
        const invoice = await stripe.invoices.retrieve(invoiceId);
        stripeInvoiceId = invoice.id ?? invoiceId;
        stripeInvoiceUrl = invoice.hosted_invoice_url ?? null;
      } catch (invoiceError) {
        console.error('[stripe.webhook] failed to load checkout invoice', invoiceError);
        stripeInvoiceId = invoiceId;
      }
    }
  }

  await syncFromStripeSubscription(client, subscription, {
    metadata: session.metadata ?? undefined,
    changedBy: session.metadata?.user_id ?? null,
    note: 'Stripe Checkout completed',
    stripeInvoiceId,
    stripeInvoiceUrl,
  });

  const schoolId = session.metadata?.school_id;

  if (schoolId && session.metadata?.coupon_id) {
    try {
      await recordSubscriptionCouponRedemption(client, {
        couponId: session.metadata.coupon_id,
        schoolId,
        stripeCheckoutSessionId: session.id,
      });
    } catch (redemptionError) {
      console.error('[stripe.webhook] coupon redemption failed', redemptionError);
    }
  }

  if (stripeInvoiceId) {
    try {
      const invoice = await stripe.invoices.retrieve(stripeInvoiceId);
      await issueSaasInvoiceFromStripe(client, invoice, schoolId ?? null);
    } catch (invoiceError) {
      console.error('[stripe.webhook] saas invoice issue failed', invoiceError);
    }
  }

  if (schoolId) {
    revalidateSubscriptionBillingPaths(schoolId);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const client = getSupabaseServerAdminClient();
  await syncFromStripeSubscription(client, subscription);
  const schoolId = subscription.metadata.school_id;

  if (schoolId) {
    revalidateSubscriptionBillingPaths(schoolId);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const schoolId = subscription.metadata.school_id;

  if (!schoolId) {
    return;
  }

  const client = getSupabaseServerAdminClient();
  await downgradeSchoolToFree(
    client,
    schoolId,
    `Stripe subscription ${subscription.id} cancelled`,
  );
  revalidateSubscriptionBillingPaths(schoolId);
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionRef = (
    invoice as Stripe.Invoice & {
      subscription?: string | Stripe.Subscription | null;
    }
  ).subscription;

  if (!subscriptionRef) {
    return;
  }

  const stripe = getStripeClient();
  const subscriptionId =
    typeof subscriptionRef === 'string' ? subscriptionRef : subscriptionRef.id;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const client = getSupabaseServerAdminClient();

  await syncFromStripeSubscription(client, subscription, {
    stripeInvoiceId: invoice.id,
    stripeInvoiceUrl: invoice.hosted_invoice_url ?? null,
    note: 'Stripe invoice paid',
  });

  const schoolId = subscription.metadata.school_id;

  try {
    await issueSaasInvoiceFromStripe(client, invoice, schoolId ?? null);
  } catch (invoiceError) {
    console.error('[stripe.webhook] saas invoice issue failed', invoiceError);
  }

  if (schoolId) {
    revalidateSubscriptionBillingPaths(schoolId);
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionRef = (
    invoice as Stripe.Invoice & {
      subscription?: string | Stripe.Subscription | null;
    }
  ).subscription;

  if (!subscriptionRef) {
    return;
  }

  const stripe = getStripeClient();
  const subscriptionId =
    typeof subscriptionRef === 'string' ? subscriptionRef : subscriptionRef.id;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const client = getSupabaseServerAdminClient();

  await syncFromStripeSubscription(client, subscription, {
    stripeInvoiceId: invoice.id,
    stripeInvoiceUrl: invoice.hosted_invoice_url ?? null,
    note: 'Stripe invoice payment failed',
  });

  const schoolId = subscription.metadata.school_id;

  if (schoolId) {
    revalidateSubscriptionBillingPaths(schoolId);
  }
}

export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripeClient();
    const body = await request.text();
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      getStripeWebhookSecret(),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid webhook';
    console.error('[stripe.webhook] signature verification failed', message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    const isNew = await markEventProcessed(event.id, event.type);

    if (!isNew) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[stripe.webhook] handler error', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 },
    );
  }
}
