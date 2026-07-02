/*
 * EPIC-008 — School-level role permission matrix
 * Customizable grants per school + RLS helper for fine-grained access.
 */

create table public.school_role_permissions (
  id uuid primary key default extensions.uuid_generate_v4(),
  school_id uuid not null references public.schools (id) on delete cascade,
  role public.school_member_role not null,
  permission text not null,
  granted boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint school_role_permissions_unique unique (school_id, role, permission),
  constraint school_role_permissions_role_not_owner check (role <> 'owner'),
  constraint school_role_permissions_role_not_parent check (role <> 'parent')
);

create index idx_school_role_permissions_school
  on public.school_role_permissions (school_id);

create trigger school_role_permissions_set_updated_at
  before update on public.school_role_permissions
  for each row execute function public.set_updated_at();

alter table public.school_role_permissions enable row level security;

create policy school_role_permissions_select on public.school_role_permissions
  for select to authenticated
  using (school_id in (select public.get_auth_user_school_ids()));

create policy school_role_permissions_manage on public.school_role_permissions
  for all to authenticated
  using (
    public.user_has_school_role(
      school_id,
      array['owner', 'admin']::public.school_member_role[]
    )
  )
  with check (
    public.user_has_school_role(
      school_id,
      array['owner', 'admin']::public.school_member_role[]
    )
  );

grant select, insert, update, delete on public.school_role_permissions
  to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Default permission resolver (must stay in sync with role-defaults.ts)
-- ---------------------------------------------------------------------------

create or replace function public.default_role_has_permission(
  p_role public.school_member_role,
  p_permission text
)
returns boolean
language sql
immutable
as $$
  select case
    when p_role = 'owner' then true
    when p_role = 'parent' then false
    when p_role = 'admin' then true
    when p_role = 'accountant' then p_permission in (
      'staff.directory.view',
      'staff.contracts.view',
      'staff.classes.view'
    )
    when p_role = 'teacher' then p_permission in (
      'staff.directory.view',
      'staff.classes.view'
    )
    when p_role = 'staff' then p_permission in (
      'staff.directory.view',
      'staff.classes.view'
    )
    else false
  end;
$$;

grant execute on function public.default_role_has_permission(
  public.school_member_role,
  text
) to authenticated, service_role;

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
  v_granted boolean;
begin
  if auth.uid() is null then
    return false;
  end if;

  select sm.role
  into v_role
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

grant execute on function public.user_has_school_permission(uuid, text)
  to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Seed defaults for existing schools
-- ---------------------------------------------------------------------------

insert into public.school_role_permissions (school_id, role, permission, granted)
select
  s.id as school_id,
  r.role,
  p.permission,
  public.default_role_has_permission(r.role, p.permission) as granted
from public.schools s
cross join (
  values
    ('admin'::public.school_member_role),
    ('accountant'::public.school_member_role),
    ('teacher'::public.school_member_role),
    ('staff'::public.school_member_role)
) as r (role)
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
where s.deleted_at is null
on conflict (school_id, role, permission) do nothing;

-- ---------------------------------------------------------------------------
-- Seed helper for new schools
-- ---------------------------------------------------------------------------

create or replace function public.seed_school_role_permissions(p_school_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.school_role_permissions (school_id, role, permission, granted)
  select
    p_school_id,
    r.role,
    p.permission,
    public.default_role_has_permission(r.role, p.permission)
  from (
    values
      ('admin'::public.school_member_role),
      ('accountant'::public.school_member_role),
      ('teacher'::public.school_member_role),
      ('staff'::public.school_member_role)
  ) as r (role)
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
  on conflict (school_id, role, permission) do nothing;
$$;

grant execute on function public.seed_school_role_permissions(uuid)
  to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Staff RLS — permission-aware policies
-- ---------------------------------------------------------------------------

drop policy if exists staff_departments_all on public.staff_departments;
drop policy if exists staff_positions_all on public.staff_positions;
drop policy if exists staff_employees_select on public.staff_employees;
drop policy if exists staff_employees_insert on public.staff_employees;
drop policy if exists staff_employees_update on public.staff_employees;
drop policy if exists staff_contracts_all on public.staff_contracts;
drop policy if exists staff_class_assignments_all on public.staff_class_assignments;

create policy staff_departments_select on public.staff_departments
  for select to authenticated
  using (
    school_id in (select public.get_auth_user_school_ids())
    and public.user_has_school_permission(school_id, 'staff.directory.view')
  );

create policy staff_departments_insert on public.staff_departments
  for insert to authenticated
  with check (
    public.user_has_school_permission(school_id, 'staff.setup.manage')
  );

create policy staff_departments_update on public.staff_departments
  for update to authenticated
  using (
    public.user_has_school_permission(school_id, 'staff.setup.manage')
  );

create policy staff_positions_select on public.staff_positions
  for select to authenticated
  using (
    school_id in (select public.get_auth_user_school_ids())
    and public.user_has_school_permission(school_id, 'staff.directory.view')
  );

create policy staff_positions_insert on public.staff_positions
  for insert to authenticated
  with check (
    public.user_has_school_permission(school_id, 'staff.setup.manage')
  );

create policy staff_positions_update on public.staff_positions
  for update to authenticated
  using (
    public.user_has_school_permission(school_id, 'staff.setup.manage')
  );

create policy staff_employees_select on public.staff_employees
  for select to authenticated
  using (
    public.user_has_school_permission(school_id, 'staff.directory.view')
  );

create policy staff_employees_insert on public.staff_employees
  for insert to authenticated
  with check (
    public.user_has_school_permission(school_id, 'staff.directory.create')
  );

create policy staff_employees_update on public.staff_employees
  for update to authenticated
  using (
    public.user_has_school_permission(school_id, 'staff.directory.update')
  );

create policy staff_contracts_select on public.staff_contracts
  for select to authenticated
  using (
    public.user_has_school_permission(school_id, 'staff.contracts.view')
  );

create policy staff_contracts_insert on public.staff_contracts
  for insert to authenticated
  with check (
    public.user_has_school_permission(school_id, 'staff.contracts.manage')
  );

create policy staff_contracts_update on public.staff_contracts
  for update to authenticated
  using (
    public.user_has_school_permission(school_id, 'staff.contracts.manage')
  );

create policy staff_contracts_delete on public.staff_contracts
  for delete to authenticated
  using (
    public.user_has_school_permission(school_id, 'staff.contracts.manage')
  );

create policy staff_class_assignments_select on public.staff_class_assignments
  for select to authenticated
  using (
    public.user_has_school_permission(school_id, 'staff.classes.view')
  );

create policy staff_class_assignments_insert on public.staff_class_assignments
  for insert to authenticated
  with check (
    public.user_has_school_permission(school_id, 'staff.classes.manage')
  );

create policy staff_class_assignments_update on public.staff_class_assignments
  for update to authenticated
  using (
    public.user_has_school_permission(school_id, 'staff.classes.manage')
  );

create policy staff_class_assignments_delete on public.staff_class_assignments
  for delete to authenticated
  using (
    public.user_has_school_permission(school_id, 'staff.classes.manage')
  );

-- Hook school onboarding
create or replace function public.create_school_for_owner(
  p_name text,
  p_slug text,
  p_phone text default null,
  p_email text default null,
  p_address text default null,
  p_campus_name text default 'Cơ sở chính'
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_school_id uuid;
  v_user_id uuid := auth.uid();
  v_package_id uuid;
  v_trial_ends timestamptz;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if exists (
    select 1
    from public.schools s
    where s.slug = p_slug
      and s.deleted_at is null
  ) then
    raise exception 'SCHOOL_SLUG_TAKEN' using errcode = 'P0001';
  end if;

  insert into public.schools (name, slug, phone, email, address)
  values (p_name, p_slug, p_phone, p_email, p_address)
  returning id into v_school_id;

  insert into public.school_members (school_id, user_id, role)
  values (v_school_id, v_user_id, 'owner');

  insert into public.campuses (school_id, name, is_main, campus_type)
  values (v_school_id, p_campus_name, true, 'campus');

  perform public.seed_school_role_permissions(v_school_id);

  select p.id
  into v_package_id
  from public.packages p
  where p.code = 'free'
  limit 1;

  if v_package_id is not null then
    v_trial_ends := now() + interval '14 days';

    insert into public.school_subscriptions (
      school_id,
      package_id,
      status,
      trial_ends_at,
      current_period_start,
      current_period_end
    )
    values (
      v_school_id,
      v_package_id,
      'trial',
      v_trial_ends,
      now(),
      v_trial_ends
    );

    insert into public.school_subscription_history (
      school_id,
      package_id,
      status,
      changed_by,
      note
    )
    values (
      v_school_id,
      v_package_id,
      'trial',
      v_user_id,
      'Initial trial subscription'
    );
  end if;

  insert into public.lead_sources (school_id, code, name, sort_order, is_active)
  values
    (v_school_id, 'facebook', 'Facebook', 0, true),
    (v_school_id, 'website', 'Website', 1, true),
    (v_school_id, 'walk_in', 'Đến trực tiếp', 2, true),
    (v_school_id, 'referral', 'Giới thiệu', 3, true),
    (v_school_id, 'hotline', 'Hotline', 4, true)
  on conflict (school_id, code) do nothing;

  return v_school_id;
end;
$$;
