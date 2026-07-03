/*
 * Student contracts — enrollment, re-enrollment, service, tuition agreement
 */

create type public.student_contract_type as enum (
  'enrollment',
  're_enrollment',
  'service',
  'tuition_agreement'
);

create type public.student_contract_status as enum (
  'draft',
  'active',
  'expired',
  'terminated',
  'cancelled'
);

create table public.student_contracts (
  id uuid primary key default extensions.uuid_generate_v4(),
  school_id uuid not null references public.schools (id) on delete cascade,
  student_id uuid not null references public.students (id) on delete restrict,
  contract_number varchar(50) not null,
  contract_type public.student_contract_type not null,
  title varchar(255) not null,
  status public.student_contract_status not null default 'draft',
  start_date date not null,
  end_date date,
  total_amount integer not null default 0 check (total_amount >= 0),
  billing_period varchar(7),
  terms text,
  invoice_id uuid references public.invoices (id) on delete set null,
  signed_at date,
  created_by uuid references public.accounts (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint student_contracts_number_unique unique (school_id, contract_number),
  constraint student_contracts_date_range check (
    end_date is null or end_date >= start_date
  )
);

create index idx_student_contracts_school
  on public.student_contracts (school_id);

create index idx_student_contracts_student
  on public.student_contracts (student_id);

create index idx_student_contracts_school_status
  on public.student_contracts (school_id, status);

create index idx_student_contracts_school_type
  on public.student_contracts (school_id, contract_type);

create index idx_student_contracts_invoice
  on public.student_contracts (invoice_id)
  where invoice_id is not null;

create trigger student_contracts_set_updated_at
  before update on public.student_contracts
  for each row execute function public.set_updated_at();

alter table public.student_contracts enable row level security;

create policy student_contracts_select on public.student_contracts
  for select to authenticated
  using (
    public.user_has_school_permission(school_id, 'students.contracts.view')
  );

create policy student_contracts_insert on public.student_contracts
  for insert to authenticated
  with check (
    public.user_has_school_permission(school_id, 'students.contracts.manage')
  );

create policy student_contracts_update on public.student_contracts
  for update to authenticated
  using (
    public.user_has_school_permission(school_id, 'students.contracts.manage')
  );

create policy student_contracts_delete on public.student_contracts
  for delete to authenticated
  using (
    public.user_has_school_permission(school_id, 'students.contracts.manage')
  );

grant select, insert, update, delete on public.student_contracts to authenticated, service_role;

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
      'students.contracts.view',
      'students.contracts.manage',
      'classes.classes.view',
      'classes.classes.manage',
      'staff.directory.view',
      'staff.classes.view',
      'staff.classes.manage',
      'staff.contracts.view',
      'reports.reports.view',
      'calendar.events.view',
      'calendar.events.manage',
      'communication.messages.view',
      'communication.messages.manage'
    )
    when p_role = 'staff' then p_permission in (
      'staff.directory.view',
      'communication.messages.view'
    )
    when p_role = 'teacher' then p_permission in (
      'staff.directory.view',
      'staff.classes.view',
      'classes.classes.view',
      'students.students.view',
      'students.contracts.view',
      'calendar.events.view',
      'communication.messages.view',
      'communication.messages.manage'
    )
    when p_role = 'accountant' then p_permission in (
      'staff.directory.view',
      'staff.contracts.view',
      'students.students.view',
      'students.contracts.view',
      'students.contracts.manage'
    )
    else false
  end;
$$;

-- Grant student contract permissions for existing schools
insert into public.school_role_permissions (school_id, role, permission, granted)
select s.id, 'admin'::public.school_member_role, p.permission, true
from public.schools s
cross join (
  values
    ('students.contracts.view'),
    ('students.contracts.manage')
) as p(permission)
where s.deleted_at is null
on conflict (school_id, role, permission)
  where custom_role_id is null and role is not null
do update set granted = true, updated_at = now();

insert into public.school_role_permissions (school_id, role, permission, granted)
select s.id, 'manager'::public.school_member_role, p.permission, p.granted
from public.schools s
cross join (
  values
    ('students.contracts.view', true),
    ('students.contracts.manage', true)
) as p(permission, granted)
where s.deleted_at is null
on conflict (school_id, role, permission)
  where custom_role_id is null and role is not null
do update set granted = excluded.granted, updated_at = now();

insert into public.school_role_permissions (school_id, role, permission, granted)
select s.id, 'teacher'::public.school_member_role, 'students.contracts.view', true
from public.schools s
where s.deleted_at is null
on conflict (school_id, role, permission)
  where custom_role_id is null and role is not null
do update set granted = true, updated_at = now();

insert into public.school_role_permissions (school_id, role, permission, granted)
select s.id, 'accountant'::public.school_member_role, p.permission, p.granted
from public.schools s
cross join (
  values
    ('students.contracts.view', true),
    ('students.contracts.manage', true)
) as p(permission, granted)
where s.deleted_at is null
on conflict (school_id, role, permission)
  where custom_role_id is null and role is not null
do update set granted = excluded.granted, updated_at = now();
