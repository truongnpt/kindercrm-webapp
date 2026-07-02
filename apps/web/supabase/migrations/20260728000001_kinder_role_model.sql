/*
 * Step 2/2: Role model defaults, seeds, and permission-aware RLS.
 * Requires manager enum from 20260728000000_kinder_role_model.sql.
 */

-- ---------------------------------------------------------------------------
-- Default permission resolver (keep in sync with role-defaults.ts)
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
    when p_role = 'manager' then p_permission in (
      'crm.leads.view',
      'crm.leads.manage',
      'students.students.view',
      'students.students.manage',
      'classes.classes.view',
      'classes.classes.manage',
      'staff.directory.view',
      'staff.classes.view',
      'staff.classes.manage',
      'staff.contracts.view',
      'reports.reports.view'
    )
    when p_role = 'staff' then p_permission in (
      'staff.directory.view'
    )
    when p_role = 'teacher' then p_permission in (
      'staff.directory.view',
      'staff.classes.view',
      'classes.classes.view',
      'students.students.view'
    )
    when p_role = 'accountant' then p_permission in (
      'staff.directory.view',
      'staff.contracts.view',
      'students.students.view'
    )
    else false
  end;
$$;

-- ---------------------------------------------------------------------------
-- Seed manager + expanded permissions for existing schools
-- ---------------------------------------------------------------------------

insert into public.school_role_permissions (school_id, role, permission, granted)
select
  s.id,
  r.role,
  p.permission,
  public.default_role_has_permission(r.role, p.permission)
from public.schools s
cross join (
  values
    ('manager'::public.school_member_role)
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
    ('staff.permissions.manage'),
    ('crm.leads.view'),
    ('crm.leads.manage'),
    ('students.students.view'),
    ('students.students.manage'),
    ('classes.classes.view'),
    ('classes.classes.manage'),
    ('reports.reports.view'),
    ('settings.school.manage'),
    ('settings.subscription.manage')
) as p (permission)
where s.deleted_at is null
on conflict do nothing;

-- Backfill new permission keys for admin/staff matrix columns
insert into public.school_role_permissions (school_id, role, permission, granted)
select
  s.id,
  r.role,
  p.permission,
  public.default_role_has_permission(r.role, p.permission)
from public.schools s
cross join (
  values
    ('admin'::public.school_member_role),
    ('staff'::public.school_member_role)
) as r (role)
cross join (
  values
    ('crm.leads.view'),
    ('crm.leads.manage'),
    ('students.students.view'),
    ('students.students.manage'),
    ('classes.classes.view'),
    ('classes.classes.manage'),
    ('reports.reports.view'),
    ('settings.school.manage'),
    ('settings.subscription.manage')
) as p (permission)
where s.deleted_at is null
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Onboarding seed for new schools
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
      ('manager'::public.school_member_role),
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
      ('staff.permissions.manage'),
      ('crm.leads.view'),
      ('crm.leads.manage'),
      ('students.students.view'),
      ('students.students.manage'),
      ('classes.classes.view'),
      ('classes.classes.manage'),
      ('reports.reports.view'),
      ('settings.school.manage'),
      ('settings.subscription.manage')
  ) as p (permission)
  on conflict do nothing;
$$;

-- ---------------------------------------------------------------------------
-- Custom role seed — all permission keys
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
      ('staff.permissions.manage'),
      ('crm.leads.view'),
      ('crm.leads.manage'),
      ('students.students.view'),
      ('students.students.manage'),
      ('classes.classes.view'),
      ('classes.classes.manage'),
      ('reports.reports.view'),
      ('settings.school.manage'),
      ('settings.subscription.manage')
  ) as p (permission)
  where scr.id = p_custom_role_id
    and scr.deleted_at is null
  on conflict do nothing;
$$;

-- ---------------------------------------------------------------------------
-- CRM RLS — permission-aware
-- ---------------------------------------------------------------------------

drop policy if exists leads_select on public.leads;
drop policy if exists leads_insert on public.leads;
drop policy if exists leads_update on public.leads;
drop policy if exists leads_delete on public.leads;

create policy leads_select on public.leads
  for select to authenticated
  using (
    public.user_has_school_permission(school_id, 'crm.leads.view')
  );

create policy leads_insert on public.leads
  for insert to authenticated
  with check (
    public.user_has_school_permission(school_id, 'crm.leads.manage')
  );

create policy leads_update on public.leads
  for update to authenticated
  using (
    public.user_has_school_permission(school_id, 'crm.leads.manage')
  );

create policy leads_delete on public.leads
  for delete to authenticated
  using (
    public.user_has_school_permission(school_id, 'crm.leads.manage')
  );

-- ---------------------------------------------------------------------------
-- Students RLS — permission-aware
-- ---------------------------------------------------------------------------

drop policy if exists students_select on public.students;
drop policy if exists students_insert on public.students;
drop policy if exists students_update on public.students;

create policy students_select on public.students
  for select to authenticated
  using (
    public.user_has_school_permission(school_id, 'students.students.view')
  );

create policy students_insert on public.students
  for insert to authenticated
  with check (
    public.user_has_school_permission(school_id, 'students.students.manage')
  );

create policy students_update on public.students
  for update to authenticated
  using (
    public.user_has_school_permission(school_id, 'students.students.manage')
  );

-- ---------------------------------------------------------------------------
-- Classes RLS — permission-aware
-- ---------------------------------------------------------------------------

drop policy if exists classes_select on public.classes;
drop policy if exists classes_insert on public.classes;
drop policy if exists classes_update on public.classes;

create policy classes_select on public.classes
  for select to authenticated
  using (
    public.user_has_school_permission(school_id, 'classes.classes.view')
  );

create policy classes_insert on public.classes
  for insert to authenticated
  with check (
    public.user_has_school_permission(school_id, 'classes.classes.manage')
  );

create policy classes_update on public.classes
  for update to authenticated
  using (
    public.user_has_school_permission(school_id, 'classes.classes.manage')
  );
