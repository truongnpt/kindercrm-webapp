/*
 * SUB-007: Idempotency log for trial reminder emails (T-7, T-3, T-1, expired).
 */

create table if not exists public.trial_email_reminders (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  reminder_kind text not null check (
    reminder_kind in ('t7', 't3', 't1', 'expired')
  ),
  recipient_email text not null,
  sent_at timestamptz not null default now(),
  constraint trial_email_reminders_school_kind_key unique (school_id, reminder_kind)
);

create index if not exists trial_email_reminders_school_id_idx
  on public.trial_email_reminders (school_id);

comment on table public.trial_email_reminders is
  'Tracks trial reminder emails sent to school owners (SUB-007).';

alter table public.trial_email_reminders enable row level security;

-- Service role / cron only (no client policies).
