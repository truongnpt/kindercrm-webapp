/*
 * Custom school roles (HR, Support, ...) with per-school permission matrix columns.
 */

-- ---------------------------------------------------------------------------
-- Custom roles per school
-- ---------------------------------------------------------------------------

create table public.school_custom_roles (
  id uuid primary key default extensions.uuid_generate_v4(),
  school_id uuid not null references public.schools (id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint school_custom_roles_name_len check (char_length(name) between 2 and 100),
  constraint school_custom_roles_slug_len check (char_length(slug) between 2 and 50),
  constraint school_custom_roles_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create unique index school_custom_roles_school_slug_unique
  on public.school_custom_roles (school_id, slug)
  where deleted_at is null;

create index idx_school_custom_roles_school
  on public.school_custom_roles (school_id)
  where deleted_at is null;

create trigger school_custom_roles_set_updated_at
  before update on public.school_custom_roles
  for each row execute function public.set_updated_at();

alter table public.school_custom_roles enable row level security;

create policy school_custom_roles_select on public.school_custom_roles
  for select to authenticated
  using (
    school_id in (select public.get_auth_user_school_ids())
    and deleted_at is null
  );

create policy school_custom_roles_manage on public.school_custom_roles
  for all to authenticated
  using (
    public.user_has_school_permission(school_id, 'staff.permissions.manage')
  )
  with check (
    public.user_has_school_permission(school_id, 'staff.permissions.manage')
  );

grant select, insert, update, delete on public.school_custom_roles
  to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Permission matrix: support custom role columns
-- ---------------------------------------------------------------------------

alter table public.school_role_permissions
  add column custom_role_id uuid references public.school_custom_roles (id) on delete cascade;

alter table public.school_role_permissions
  alter column role drop not null;

alter table public.school_role_permissions
  drop constraint school_role_permissions_unique;

alter table public.school_role_permissions
  add constraint school_role_permissions_target_check check (
    (role is not null and custom_role_id is null)
    or (role is null and custom_role_id is not null)
  );

create unique index school_role_permissions_system_unique
  on public.school_role_permissions (school_id, role, permission)
  where custom_role_id is null and role is not null;

create unique index school_role_permissions_custom_unique
  on public.school_role_permissions (school_id, custom_role_id, permission)
  where custom_role_id is not null;

-- ---------------------------------------------------------------------------
-- Members & staff can be assigned a custom role
-- ---------------------------------------------------------------------------

alter table public.school_members
  add column custom_role_id uuid references public.school_custom_roles (id) on delete set null;

create index idx_school_members_custom_role
  on public.school_members (custom_role_id)
  where custom_role_id is not null;

alter table public.staff_employees
  add column custom_role_id uuid references public.school_custom_roles (id) on delete set null;

create index idx_staff_employees_custom_role
  on public.staff_employees (custom_role_id)
  where custom_role_id is not null;

-- ---------------------------------------------------------------------------
-- Seed permissions for a new custom role (all denied by default)
-- ---------------------------------------------------------------------------

create or replace function public.seed_custom_role_permissions(p_custom_role_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.school_role_permissions (
    school_id,
    role,
    custom_role_id,
    permission,
    granted
  )
  select
    scr.school_id,
    null,
    scr.id,
    p.permission,
    false
  from public.school_custom_roles scr
  cross join (
    values
      ('staff.directory.view'),
      ('staff.directory.create'),
      ('staff.directory.update'),
      ('staff.directory.delete'),
      ('staff.setup.manage'),
      ('staff.contracts.view'),
      ('staff.contracts.manage'),
      ('staff.classes.view'),
      ('staff.classes.manage'),
      ('staff.access.manage'),
      ('staff.permissions.manage')
  ) as p (permission)
  where scr.id = p_custom_role_id
    and scr.deleted_at is null
  on conflict do nothing;
$$;

grant execute on function public.seed_custom_role_permissions(uuid)
  to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Permission resolver — honor custom_role_id on membership
-- ---------------------------------------------------------------------------

create or replace function public.user_has_school_permission(
  p_school_id uuid,
  p_permission text
)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_role public.school_member_role;
  v_custom_role_id uuid;
  v_granted boolean;
begin
  if auth.uid() is null then
    return false;
  end if;

  select sm.role, sm.custom_role_id
  into v_role, v_custom_role_id
  from public.school_members sm
  where sm.school_id = p_school_id
    and sm.user_id = auth.uid()
    and sm.deleted_at is null;

  if v_role is null then
    return false;
  end if;

  if v_role = 'owner' then
    return true;
  end if;

  if v_role = 'parent' then
    return false;
  end if;

  if v_custom_role_id is not null then
    select srp.granted
    into v_granted
    from public.school_role_permissions srp
    where srp.school_id = p_school_id
      and srp.custom_role_id = v_custom_role_id
      and srp.permission = p_permission;

    return coalesce(v_granted, false);
  end if;

  select srp.granted
  into v_granted
  from public.school_role_permissions srp
  where srp.school_id = p_school_id
    and srp.role = v_role
    and srp.permission = p_permission;

  if found then
    return v_granted;
  end if;

  return public.default_role_has_permission(v_role, p_permission);
end;
$$;
