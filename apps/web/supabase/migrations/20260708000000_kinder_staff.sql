/*
 * EPIC-008 — Staff / Employee Management (production core)
 * Teacher is a flag (is_teacher), not a separate entity.
 */

create type public.staff_employment_status as enum (
  'active',
  'inactive',
  'on_leave',
  'terminated'
);

create type public.staff_contract_type as enum (
  'full_time',
  'part_time',
  'contract',
  'probation'
);

create type public.staff_access_role as enum (
  'staff',
  'admin',
  'accountant'
);

-- TEACHER-002 Department
create table public.staff_departments (
  id uuid primary key default extensions.uuid_generate_v4(),
  school_id uuid not null references public.schools (id) on delete cascade,
  name varchar(255) not null,
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint staff_departments_school_name_unique unique (school_id, name)
);

-- TEACHER-003 Position
create table public.staff_positions (
  id uuid primary key default extensions.uuid_generate_v4(),
  school_id uuid not null references public.schools (id) on delete cascade,
  department_id uuid references public.staff_departments (id) on delete set null,
  name varchar(255) not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint staff_positions_school_name_unique unique (school_id, name)
);

-- TEACHER-001 Employee profile (all staff; is_teacher = checkbox)
create table public.staff_employees (
  id uuid primary key default extensions.uuid_generate_v4(),
  school_id uuid not null references public.schools (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  member_id uuid references public.school_members (id) on delete set null,
  employee_code varchar(50) not null,
  full_name varchar(255) not null,
  email varchar(320),
  phone varchar(50),
  is_teacher boolean not null default false,
  access_role public.staff_access_role not null default 'staff',
  grant_system_access boolean not null default false,
  department_id uuid references public.staff_departments (id) on delete set null,
  position_id uuid references public.staff_positions (id) on delete set null,
  campus_id uuid references public.campuses (id) on delete set null,
  employment_status public.staff_employment_status not null default 'active',
  hire_date date,
  termination_date date,
  date_of_birth date,
  gender varchar(20),
  id_number varchar(50),
  address text,
  emergency_contact_name varchar(255),
  emergency_contact_phone varchar(50),
  notes text,
  photo_url text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint staff_employees_school_code_unique unique (school_id, employee_code)
);

create unique index idx_staff_employees_member on public.staff_employees (member_id)
  where member_id is not null and deleted_at is null;

create index idx_staff_employees_school_active on public.staff_employees (school_id)
  where deleted_at is null;

create index idx_staff_employees_teachers on public.staff_employees (school_id, is_teacher)
  where is_teacher = true and deleted_at is null and employment_status = 'active';

create index idx_staff_employees_user on public.staff_employees (user_id)
  where user_id is not null and deleted_at is null;

-- TEACHER-004 Contract
create table public.staff_contracts (
  id uuid primary key default extensions.uuid_generate_v4(),
  school_id uuid not null references public.schools (id) on delete cascade,
  employee_id uuid not null references public.staff_employees (id) on delete cascade,
  contract_type public.staff_contract_type not null default 'full_time',
  title varchar(255) not null,
  start_date date not null,
  end_date date,
  salary_amount integer not null default 0 check (salary_amount >= 0),
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_staff_contracts_employee on public.staff_contracts (employee_id);

-- TEACHER-006 Supplemental class assignment (homeroom still on classes.teacher_user_id)
create table public.staff_class_assignments (
  id uuid primary key default extensions.uuid_generate_v4(),
  school_id uuid not null references public.schools (id) on delete cascade,
  employee_id uuid not null references public.staff_employees (id) on delete cascade,
  class_id uuid not null references public.classes (id) on delete cascade,
  assignment_role varchar(50) not null default 'assistant',
  assigned_at date not null default current_date,
  created_at timestamptz not null default now(),
  constraint staff_class_assignments_unique unique (employee_id, class_id, assignment_role)
);

create trigger staff_departments_set_updated_at
  before update on public.staff_departments
  for each row execute function public.set_updated_at();

create trigger staff_positions_set_updated_at
  before update on public.staff_positions
  for each row execute function public.set_updated_at();

create trigger staff_employees_set_updated_at
  before update on public.staff_employees
  for each row execute function public.set_updated_at();

create trigger staff_contracts_set_updated_at
  before update on public.staff_contracts
  for each row execute function public.set_updated_at();

-- RLS
alter table public.staff_departments enable row level security;
alter table public.staff_positions enable row level security;
alter table public.staff_employees enable row level security;
alter table public.staff_contracts enable row level security;
alter table public.staff_class_assignments enable row level security;

create policy staff_departments_all on public.staff_departments
  for all to authenticated
  using (school_id in (select public.get_auth_user_school_ids()))
  with check (
    public.user_has_school_role(school_id, array['owner', 'admin']::public.school_member_role[])
  );

create policy staff_positions_all on public.staff_positions
  for all to authenticated
  using (school_id in (select public.get_auth_user_school_ids()))
  with check (
    public.user_has_school_role(school_id, array['owner', 'admin']::public.school_member_role[])
  );

create policy staff_employees_select on public.staff_employees
  for select to authenticated
  using (school_id in (select public.get_auth_user_school_ids()));

create policy staff_employees_insert on public.staff_employees
  for insert to authenticated
  with check (
    public.user_has_school_role(school_id, array['owner', 'admin']::public.school_member_role[])
  );

create policy staff_employees_update on public.staff_employees
  for update to authenticated
  using (
    public.user_has_school_role(school_id, array['owner', 'admin']::public.school_member_role[])
  );

create policy staff_contracts_all on public.staff_contracts
  for all to authenticated
  using (school_id in (select public.get_auth_user_school_ids()))
  with check (
    public.user_has_school_role(school_id, array['owner', 'admin']::public.school_member_role[])
  );

create policy staff_class_assignments_all on public.staff_class_assignments
  for all to authenticated
  using (school_id in (select public.get_auth_user_school_ids()))
  with check (
    public.user_has_school_role(school_id, array['owner', 'admin']::public.school_member_role[])
  );

grant select, insert, update on public.staff_departments to authenticated, service_role;
grant select, insert, update on public.staff_positions to authenticated, service_role;
grant select, insert, update on public.staff_employees to authenticated, service_role;
grant select, insert, update, delete on public.staff_contracts to authenticated, service_role;
grant select, insert, update, delete on public.staff_class_assignments to authenticated, service_role;
