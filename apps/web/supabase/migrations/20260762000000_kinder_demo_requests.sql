-- MARKETING-001: Public marketing request demo form + platform review workflow

create table public.demo_requests (
  id uuid primary key default extensions.uuid_generate_v4(),
  school_name text not null check (char_length(trim(school_name)) >= 2),
  email text not null check (position('@' in email) > 1),
  phone text not null check (char_length(trim(phone)) >= 8),
  message text not null check (char_length(trim(message)) >= 10),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_at timestamptz,
  reviewed_by_user_id uuid references auth.users (id) on delete set null,
  review_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_demo_requests_created
  on public.demo_requests (created_at desc);

create index idx_demo_requests_status
  on public.demo_requests (status, created_at desc);

create or replace function public.set_demo_requests_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger trg_demo_requests_updated_at
before update on public.demo_requests
for each row
execute procedure public.set_demo_requests_updated_at();

alter table public.demo_requests enable row level security;

-- Public marketing form submit (unauthenticated visitors allowed)
create policy demo_requests_insert_public on public.demo_requests
  for insert
  to anon, authenticated
  with check (status = 'pending');

-- Platform admins can read and process all requests
create policy demo_requests_select_platform on public.demo_requests
  for select
  to authenticated
  using (
    public.is_platform_admin(
      array['super_admin', 'support', 'billing']::public.platform_admin_role[]
    )
  );

create policy demo_requests_update_platform on public.demo_requests
  for update
  to authenticated
  using (
    public.is_platform_admin(
      array['super_admin', 'support', 'billing']::public.platform_admin_role[]
    )
  )
  with check (
    public.is_platform_admin(
      array['super_admin', 'support', 'billing']::public.platform_admin_role[]
    )
  );

comment on table public.demo_requests is
  'Marketing request-demo form submissions with platform approve/reject workflow.';
