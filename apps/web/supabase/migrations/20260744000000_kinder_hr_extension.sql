/*
 * EPIC-018 HR extension — attendance, leave, documents, employment enhancements
 */

-- HR-004: direct manager
alter table public.staff_employees
  add column if not exists manager_id uuid
    references public.staff_employees (id) on delete set null;

create index if not exists idx_staff_employees_manager
  on public.staff_employees (manager_id)
  where manager_id is not null and deleted_at is null;

-- HR-008: contract document + termination tracking
alter table public.staff_contracts
  add column if not exists document_url text,
  add column if not exists terminated_at timestamptz;

-- HR-006: staff attendance
create type public.staff_attendance_source as enum ('check_in', 'manual');

create table public.staff_attendance (
  id uuid primary key default extensions.uuid_generate_v4(),
  school_id uuid not null references public.schools (id) on delete cascade,
  employee_id uuid not null references public.staff_employees (id) on delete cascade,
  attendance_date date not null,
  check_in_at timestamptz,
  check_out_at timestamptz,
  total_minutes integer check (total_minutes is null or total_minutes >= 0),
  is_late boolean not null default false,
  is_early_leave boolean not null default false,
  source public.staff_attendance_source not null default 'manual',
  notes text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint staff_attendance_unique unique (employee_id, attendance_date),
  constraint staff_attendance_checkout_after_checkin check (
    check_out_at is null
    or check_in_at is null
    or check_out_at >= check_in_at
  )
);

create index idx_staff_attendance_school_date
  on public.staff_attendance (school_id, attendance_date desc);

create index idx_staff_attendance_employee
  on public.staff_attendance (employee_id, attendance_date desc);

-- HR-007: leave management
create type public.staff_leave_type as enum (
  'annual',
  'sick',
  'unpaid',
  'other'
);

create type public.staff_leave_status as enum (
  'pending',
  'approved',
  'rejected',
  'cancelled'
);

create table public.staff_leave_requests (
  id uuid primary key default extensions.uuid_generate_v4(),
  school_id uuid not null references public.schools (id) on delete cascade,
  employee_id uuid not null references public.staff_employees (id) on delete cascade,
  leave_type public.staff_leave_type not null default 'annual',
  status public.staff_leave_status not null default 'pending',
  start_date date not null,
  end_date date not null,
  days_count numeric(5, 1) not null default 1 check (days_count > 0),
  reason text,
  reviewed_by uuid references auth.users (id) on delete set null,
  reviewed_at timestamptz,
  review_note text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint staff_leave_date_range check (end_date >= start_date)
);

create index idx_staff_leave_school_status
  on public.staff_leave_requests (school_id, status);

create index idx_staff_leave_employee
  on public.staff_leave_requests (employee_id, start_date desc);

-- HR-009: HR documents
create type public.staff_document_type as enum (
  'id_card',
  'degree',
  'certificate',
  'contract',
  'other'
);

create table public.staff_documents (
  id uuid primary key default extensions.uuid_generate_v4(),
  school_id uuid not null references public.schools (id) on delete cascade,
  employee_id uuid not null references public.staff_employees (id) on delete cascade,
  document_type public.staff_document_type not null default 'other',
  title varchar(255) not null,
  file_url text not null,
  file_name varchar(255),
  expires_at date,
  notes text,
  uploaded_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_staff_documents_employee
  on public.staff_documents (employee_id, created_at desc);

create trigger staff_attendance_set_updated_at
  before update on public.staff_attendance
  for each row execute function public.set_updated_at();

create trigger staff_leave_requests_set_updated_at
  before update on public.staff_leave_requests
  for each row execute function public.set_updated_at();

create trigger staff_documents_set_updated_at
  before update on public.staff_documents
  for each row execute function public.set_updated_at();

alter table public.staff_attendance enable row level security;
alter table public.staff_leave_requests enable row level security;
alter table public.staff_documents enable row level security;

create policy staff_attendance_select on public.staff_attendance
  for select to authenticated
  using (
    public.user_has_school_permission(school_id, 'staff.attendance.view')
  );

create policy staff_attendance_insert on public.staff_attendance
  for insert to authenticated
  with check (
    public.user_has_school_permission(school_id, 'staff.attendance.manage')
  );

create policy staff_attendance_update on public.staff_attendance
  for update to authenticated
  using (
    public.user_has_school_permission(school_id, 'staff.attendance.manage')
  );

create policy staff_attendance_delete on public.staff_attendance
  for delete to authenticated
  using (
    public.user_has_school_permission(school_id, 'staff.attendance.manage')
  );

create policy staff_leave_select on public.staff_leave_requests
  for select to authenticated
  using (
    public.user_has_school_permission(school_id, 'staff.leave.view')
  );

create policy staff_leave_insert on public.staff_leave_requests
  for insert to authenticated
  with check (
    public.user_has_school_permission(school_id, 'staff.leave.manage')
    or public.user_has_school_permission(school_id, 'staff.leave.view')
  );

create policy staff_leave_update on public.staff_leave_requests
  for update to authenticated
  using (
    public.user_has_school_permission(school_id, 'staff.leave.manage')
  );

create policy staff_documents_select on public.staff_documents
  for select to authenticated
  using (
    public.user_has_school_permission(school_id, 'staff.documents.view')
  );

create policy staff_documents_insert on public.staff_documents
  for insert to authenticated
  with check (
    public.user_has_school_permission(school_id, 'staff.documents.manage')
  );

create policy staff_documents_update on public.staff_documents
  for update to authenticated
  using (
    public.user_has_school_permission(school_id, 'staff.documents.manage')
  );

create policy staff_documents_delete on public.staff_documents
  for delete to authenticated
  using (
    public.user_has_school_permission(school_id, 'staff.documents.manage')
  );

grant select, insert, update, delete on public.staff_attendance to authenticated, service_role;
grant select, insert, update, delete on public.staff_leave_requests to authenticated, service_role;
grant select, insert, update, delete on public.staff_documents to authenticated, service_role;

-- Storage bucket for HR documents (private)
do $staff_documents_storage$
begin
  if not exists (
    select 1
    from information_schema.tables
    where table_schema = 'storage'
      and table_name = 'buckets'
  ) then
    return;
  end if;

  insert into storage.buckets (id, name, public, file_size_limit)
  values ('staff_documents', 'staff_documents', false, 10485760)
  on conflict (id) do nothing;

  drop policy if exists staff_documents_storage_select on storage.objects;
  drop policy if exists staff_documents_storage_insert on storage.objects;
  drop policy if exists staff_documents_storage_delete on storage.objects;

  create policy staff_documents_storage_select on storage.objects
    for select to authenticated
    using (
      bucket_id = 'staff_documents'
      and (storage.foldername(name))[1]::uuid in (
        select public.get_auth_user_school_ids()
      )
    );

  create policy staff_documents_storage_insert on storage.objects
    for insert to authenticated
    with check (
      bucket_id = 'staff_documents'
      and (storage.foldername(name))[1]::uuid in (
        select public.get_auth_user_school_ids()
      )
      and public.user_has_school_permission(
        (storage.foldername(name))[1]::uuid,
        'staff.documents.manage'
      )
    );

  create policy staff_documents_storage_delete on storage.objects
    for delete to authenticated
    using (
      bucket_id = 'staff_documents'
      and (storage.foldername(name))[1]::uuid in (
        select public.get_auth_user_school_ids()
      )
      and public.user_has_school_permission(
        (storage.foldername(name))[1]::uuid,
        'staff.documents.manage'
      )
    );
end $staff_documents_storage$;

-- ---------------------------------------------------------------------------
-- Permissions seed + default_role_has_permission sync
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
      'staff.attendance.view',
      'staff.attendance.manage',
      'staff.leave.view',
      'staff.leave.manage',
      'staff.documents.view',
      'reports.reports.view',
      'calendar.events.view',
      'calendar.events.manage',
      'communication.messages.view',
      'communication.messages.manage'
    )
    when p_role = 'staff' then p_permission in (
      'staff.directory.view',
      'staff.attendance.view',
      'staff.leave.view',
      'communication.messages.view'
    )
    when p_role = 'teacher' then p_permission in (
      'staff.directory.view',
      'staff.classes.view',
      'staff.attendance.view',
      'staff.leave.view',
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
      'staff.documents.view',
      'students.students.view',
      'students.contracts.view',
      'students.contracts.manage'
    )
    else false
  end;
$$;

insert into public.school_role_permissions (school_id, role, permission, granted)
select s.id, 'admin'::public.school_member_role, p.permission, true
from public.schools s
cross join (
  values
    ('staff.attendance.view'),
    ('staff.attendance.manage'),
    ('staff.leave.view'),
    ('staff.leave.manage'),
    ('staff.documents.view'),
    ('staff.documents.manage')
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
    ('staff.attendance.view', true),
    ('staff.attendance.manage', true),
    ('staff.leave.view', true),
    ('staff.leave.manage', true),
    ('staff.documents.view', true),
    ('staff.documents.manage', false)
) as p(permission, granted)
where s.deleted_at is null
on conflict (school_id, role, permission)
  where custom_role_id is null and role is not null
do update set granted = excluded.granted, updated_at = now();

insert into public.school_role_permissions (school_id, role, permission, granted)
select s.id, r.role, p.permission, p.granted
from public.schools s
cross join (
  values ('staff'::public.school_member_role), ('teacher'::public.school_member_role)
) as r(role)
cross join (
  values
    ('staff.attendance.view', true),
    ('staff.leave.view', true)
) as p(permission, granted)
where s.deleted_at is null
on conflict (school_id, role, permission)
  where custom_role_id is null and role is not null
do update set granted = excluded.granted, updated_at = now();

insert into public.school_role_permissions (school_id, role, permission, granted)
select s.id, 'accountant'::public.school_member_role, 'staff.documents.view', true
from public.schools s
where s.deleted_at is null
on conflict (school_id, role, permission)
  where custom_role_id is null and role is not null
do update set granted = true, updated_at = now();
