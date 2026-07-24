/*
 * Kinder PMS — EPIC-035 Platform Super Admin
 * Platform-level administrators and audit trail (cross-tenant)
 */

create type public.platform_admin_role as enum (
  'super_admin',
  'support',
  'billing'
);

create table public.platform_admins (
  id uuid primary key default extensions.uuid_generate_v4(),
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.platform_admin_role not null default 'super_admin',
  is_active boolean not null default true,
  granted_by uuid references auth.users (id) on delete set null,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  notes text,
  constraint platform_admins_user_unique unique (user_id)
);

create index idx_platform_admins_user_active
  on public.platform_admins (user_id)
  where is_active = true and revoked_at is null;

create table public.platform_audit_logs (
  id uuid primary key default extensions.uuid_generate_v4(),
  actor_user_id uuid not null references auth.users (id) on delete restrict,
  action varchar(100) not null,
  target_type varchar(50) not null,
  target_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  ip_address inet,
  created_at timestamptz not null default now()
);

create index idx_platform_audit_logs_created
  on public.platform_audit_logs (created_at desc);

create index idx_platform_audit_logs_target
  on public.platform_audit_logs (target_type, target_id);

create or replace function public.is_platform_admin(
  allowed_roles public.platform_admin_role[] default array['super_admin']::public.platform_admin_role[]
)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.platform_admins pa
    where pa.user_id = auth.uid()
      and pa.is_active = true
      and pa.revoked_at is null
      and pa.role = any (allowed_roles)
  );
$$;

grant execute on function public.is_platform_admin(public.platform_admin_role[])
  to authenticated, service_role;

alter table public.platform_admins enable row level security;
alter table public.platform_audit_logs enable row level security;

-- Users can check their own platform admin status (for nav / guards)
create policy platform_admins_select_self on public.platform_admins
  for select to authenticated
  using (user_id = auth.uid());

create policy platform_admins_select on public.platform_admins
  for select to authenticated
  using (
    public.is_platform_admin(
      array['super_admin', 'support', 'billing']::public.platform_admin_role[]
    )
  );

create policy platform_admins_insert on public.platform_admins
  for insert to authenticated
  with check (
    public.is_platform_admin(array['super_admin']::public.platform_admin_role[])
  );

create policy platform_admins_update on public.platform_admins
  for update to authenticated
  using (
    public.is_platform_admin(array['super_admin']::public.platform_admin_role[])
  );

create policy platform_audit_logs_select on public.platform_audit_logs
  for select to authenticated
  using (
    public.is_platform_admin(
      array['super_admin', 'support', 'billing']::public.platform_admin_role[]
    )
  );
