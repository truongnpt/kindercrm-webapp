/*
 * Kinder PMS — Phase 1 foundation
 * EPIC-001 Tenant Management + EPIC-002 Subscription & Package (core tables)
 */

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type public.school_status as enum ('active', 'suspended', 'archived');
create type public.school_member_role as enum (
  'owner',
  'admin',
  'staff',
  'teacher',
  'accountant'
);
create type public.campus_type as enum ('campus', 'branch');
create type public.subscription_status as enum (
  'trial',
  'active',
  'past_due',
  'cancelled'
);

-- ---------------------------------------------------------------------------
-- Schools (tenant)
-- ---------------------------------------------------------------------------

create table public.schools (
  id uuid primary key default extensions.uuid_generate_v4(),
  name varchar(255) not null,
  slug varchar(100) not null,
  logo_url text,
  theme_primary_color varchar(7),
  custom_domain varchar(255),
  phone varchar(50),
  email varchar(320),
  address text,
  status public.school_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint schools_slug_unique unique (slug)
);

create index idx_schools_status on public.schools (status) where deleted_at is null;

-- ---------------------------------------------------------------------------
-- Campuses & branches (TENANT-008, TENANT-009)
-- ---------------------------------------------------------------------------

create table public.campuses (
  id uuid primary key default extensions.uuid_generate_v4(),
  school_id uuid not null references public.schools (id) on delete cascade,
  parent_campus_id uuid references public.campuses (id) on delete set null,
  campus_type public.campus_type not null default 'campus',
  name varchar(255) not null,
  address text,
  phone varchar(50),
  is_main boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index idx_campuses_school on public.campuses (school_id) where deleted_at is null;

-- ---------------------------------------------------------------------------
-- School members (multi-tenant access)
-- ---------------------------------------------------------------------------

create table public.school_members (
  id uuid primary key default extensions.uuid_generate_v4(),
  school_id uuid not null references public.schools (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.school_member_role not null default 'staff',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint school_members_school_user_unique unique (school_id, user_id)
);

create index idx_school_members_user on public.school_members (user_id) where deleted_at is null;

-- ---------------------------------------------------------------------------
-- Packages & subscriptions (EPIC-002)
-- ---------------------------------------------------------------------------

create table public.packages (
  id uuid primary key default extensions.uuid_generate_v4(),
  code varchar(50) not null,
  name varchar(255) not null,
  description text,
  max_students integer not null default 50,
  max_campuses integer not null default 1,
  max_storage_mb integer not null default 1024,
  ai_credits_monthly integer not null default 0,
  features jsonb not null default '{}'::jsonb,
  price_monthly bigint not null default 0,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint packages_code_unique unique (code)
);

create table public.school_subscriptions (
  id uuid primary key default extensions.uuid_generate_v4(),
  school_id uuid not null references public.schools (id) on delete cascade,
  package_id uuid not null references public.packages (id),
  status public.subscription_status not null default 'trial',
  trial_ends_at timestamptz,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint school_subscriptions_school_unique unique (school_id)
);

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.get_auth_user_school_ids()
returns setof uuid
language sql
security definer
set search_path = ''
stable
as $$
  select sm.school_id
  from public.school_members sm
  join public.schools s on s.id = sm.school_id
  where sm.user_id = auth.uid()
    and sm.deleted_at is null
    and s.deleted_at is null
    and s.status = 'active';
$$;

grant execute on function public.get_auth_user_school_ids() to authenticated, service_role;

create or replace function public.user_has_school_role(
  target_school_id uuid,
  allowed_roles public.school_member_role[]
)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.school_members sm
    where sm.school_id = target_school_id
      and sm.user_id = auth.uid()
      and sm.deleted_at is null
      and sm.role = any (allowed_roles)
  );
$$;

grant execute on function public.user_has_school_role(uuid, public.school_member_role[]) to authenticated, service_role;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger schools_set_updated_at
  before update on public.schools
  for each row execute function public.set_updated_at();

create trigger campuses_set_updated_at
  before update on public.campuses
  for each row execute function public.set_updated_at();

create trigger school_members_set_updated_at
  before update on public.school_members
  for each row execute function public.set_updated_at();

create trigger packages_set_updated_at
  before update on public.packages
  for each row execute function public.set_updated_at();

create trigger school_subscriptions_set_updated_at
  before update on public.school_subscriptions
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.schools enable row level security;
alter table public.campuses enable row level security;
alter table public.school_members enable row level security;
alter table public.packages enable row level security;
alter table public.school_subscriptions enable row level security;

-- schools
create policy schools_select on public.schools
  for select to authenticated
  using (id in (select public.get_auth_user_school_ids()));

create policy schools_insert on public.schools
  for insert to authenticated
  with check (true);

create policy schools_update on public.schools
  for update to authenticated
  using (
    public.user_has_school_role(id, array['owner', 'admin']::public.school_member_role[])
  )
  with check (
    public.user_has_school_role(id, array['owner', 'admin']::public.school_member_role[])
  );

-- campuses
create policy campuses_select on public.campuses
  for select to authenticated
  using (school_id in (select public.get_auth_user_school_ids()));

create policy campuses_insert on public.campuses
  for insert to authenticated
  with check (
    public.user_has_school_role(school_id, array['owner', 'admin']::public.school_member_role[])
  );

create policy campuses_update on public.campuses
  for update to authenticated
  using (
    public.user_has_school_role(school_id, array['owner', 'admin']::public.school_member_role[])
  )
  with check (
    public.user_has_school_role(school_id, array['owner', 'admin']::public.school_member_role[])
  );

-- school_members
create policy school_members_select on public.school_members
  for select to authenticated
  using (
    school_id in (select public.get_auth_user_school_ids())
    or user_id = auth.uid()
  );

create policy school_members_insert on public.school_members
  for insert to authenticated
  with check (
    user_id = auth.uid()
    or public.user_has_school_role(school_id, array['owner', 'admin']::public.school_member_role[])
  );

create policy school_members_update on public.school_members
  for update to authenticated
  using (
    public.user_has_school_role(school_id, array['owner', 'admin']::public.school_member_role[])
  );

-- packages (public read for authenticated users)
create policy packages_select on public.packages
  for select to authenticated
  using (is_active = true);

-- subscriptions
create policy school_subscriptions_select on public.school_subscriptions
  for select to authenticated
  using (school_id in (select public.get_auth_user_school_ids()));

create policy school_subscriptions_insert on public.school_subscriptions
  for insert to authenticated
  with check (
    public.user_has_school_role(school_id, array['owner']::public.school_member_role[])
    or not exists (
      select 1 from public.school_members sm
      where sm.school_id = school_subscriptions.school_id
    )
  );

create policy school_subscriptions_update on public.school_subscriptions
  for update to authenticated
  using (
    public.user_has_school_role(school_id, array['owner', 'admin']::public.school_member_role[])
  );

-- Grants
grant select, insert, update on public.schools to authenticated, service_role;
grant select, insert, update on public.campuses to authenticated, service_role;
grant select, insert, update on public.school_members to authenticated, service_role;
grant select on public.packages to authenticated, service_role;
grant select, insert, update on public.school_subscriptions to authenticated, service_role;
