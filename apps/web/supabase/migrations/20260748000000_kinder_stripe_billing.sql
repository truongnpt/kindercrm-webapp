/*
 * SUB-001 / SUB-002: Stripe billing columns for SaaS subscriptions.
 */

alter table public.packages
  add column if not exists stripe_price_id text;

comment on column public.packages.stripe_price_id is
  'Stripe Price ID (price_…) for Checkout subscription mode.';

alter table public.school_subscriptions
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text;

create unique index if not exists school_subscriptions_stripe_subscription_id_idx
  on public.school_subscriptions (stripe_subscription_id)
  where stripe_subscription_id is not null;

create table if not exists public.stripe_webhook_events (
  id text primary key,
  event_type text not null,
  processed_at timestamptz not null default now()
);

comment on table public.stripe_webhook_events is
  'Idempotency log for Stripe webhook event IDs.';

alter table public.stripe_webhook_events enable row level security;

-- Only service role / migrations touch this table (no client policies).
