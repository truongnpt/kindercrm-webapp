/*
 * Staff invite tracking — provision via Supabase invite email flow.
 */

alter table public.staff_employees
  add column if not exists invite_sent_at timestamptz,
  add column if not exists invite_accepted_at timestamptz;

comment on column public.staff_employees.invite_sent_at is
  'When the last system-access invite email was sent.';
comment on column public.staff_employees.invite_accepted_at is
  'When the employee completed invite acceptance (set password).';
