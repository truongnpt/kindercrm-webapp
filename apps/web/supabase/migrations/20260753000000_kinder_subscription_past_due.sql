-- SUB-010: Track when a subscription entered past_due (grace period for read-only)

alter table public.school_subscriptions
  add column if not exists past_due_at timestamptz;

comment on column public.school_subscriptions.past_due_at is
  'First timestamp the subscription became past_due; used for grace period before read-only.';
