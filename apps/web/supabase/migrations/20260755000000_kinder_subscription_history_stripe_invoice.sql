/*
 * SUB-019 — Subscription history: Stripe invoice reference for support
 */

alter table public.school_subscription_history
  add column if not exists stripe_invoice_id text,
  add column if not exists stripe_invoice_url text;

comment on column public.school_subscription_history.stripe_invoice_id is
  'Stripe Invoice ID (in_xxx) when change originated from billing';

comment on column public.school_subscription_history.stripe_invoice_url is
  'Hosted invoice URL captured at webhook time for owner-facing links';
