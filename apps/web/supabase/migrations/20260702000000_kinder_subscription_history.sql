/*
 * EPIC-002 — PACKAGE-010 Package History
 */

create table public.school_subscription_history (
  id uuid primary key default extensions.uuid_generate_v4(),
  school_id uuid not null references public.schools (id) on delete cascade,
  package_id uuid not null references public.packages (id),
  previous_package_id uuid references public.packages (id),
  status public.subscription_status not null,
  changed_by uuid references auth.users (id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);

create index idx_school_subscription_history_school
  on public.school_subscription_history (school_id, created_at desc);

alter table public.school_subscription_history enable row level security;

create policy school_subscription_history_select on public.school_subscription_history
  for select to authenticated
  using (school_id in (select public.get_auth_user_school_ids()));

create policy school_subscription_history_insert on public.school_subscription_history
  for insert to authenticated
  with check (
    public.user_has_school_role(school_id, array['owner', 'admin']::public.school_member_role[])
  );

grant select, insert on public.school_subscription_history to authenticated, service_role;
