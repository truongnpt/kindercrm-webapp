/*
 * EPIC-004 — Student Management (core)
 */

create type public.student_status as enum (
  'active',
  'inactive',
  'graduated',
  'transferred',
  'withdrawn'
);

create type public.student_gender as enum ('male', 'female', 'other');

create type public.student_timeline_event as enum (
  'created',
  'updated',
  'status_changed',
  'class_transfer',
  'graduated',
  'note',
  'parent_added',
  'medical_updated'
);

-- STUDENT-001 / STUDENT-002 / STUDENT-010
create table public.students (
  id uuid primary key default extensions.uuid_generate_v4(),
  school_id uuid not null references public.schools (id) on delete cascade,
  campus_id uuid references public.campuses (id) on delete set null,
  lead_id uuid references public.leads (id) on delete set null,
  student_code varchar(50) not null,
  full_name varchar(255) not null,
  date_of_birth date,
  gender public.student_gender,
  photo_url text,
  status public.student_status not null default 'active',
  class_name varchar(255),
  enrollment_date date,
  notes text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint students_school_code_unique unique (school_id, student_code)
);

create index idx_students_school_status on public.students (school_id, status)
  where deleted_at is null;

create index idx_students_school_name on public.students (school_id, full_name)
  where deleted_at is null;

-- STUDENT-003
create table public.student_parents (
  id uuid primary key default extensions.uuid_generate_v4(),
  student_id uuid not null references public.students (id) on delete cascade,
  school_id uuid not null references public.schools (id) on delete cascade,
  full_name varchar(255) not null,
  phone varchar(50),
  email varchar(320),
  relationship varchar(50) not null default 'guardian',
  is_primary boolean not null default false,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_student_parents_student on public.student_parents (student_id);

-- STUDENT-004
create table public.student_emergency_contacts (
  id uuid primary key default extensions.uuid_generate_v4(),
  student_id uuid not null references public.students (id) on delete cascade,
  school_id uuid not null references public.schools (id) on delete cascade,
  full_name varchar(255) not null,
  phone varchar(50) not null,
  relationship varchar(50),
  created_at timestamptz not null default now()
);

-- STUDENT-005
create table public.student_medical_records (
  student_id uuid primary key references public.students (id) on delete cascade,
  school_id uuid not null references public.schools (id) on delete cascade,
  blood_type varchar(10),
  conditions text,
  medications text,
  doctor_name varchar(255),
  doctor_phone varchar(50),
  notes text,
  updated_at timestamptz not null default now()
);

-- STUDENT-006
create table public.student_allergies (
  id uuid primary key default extensions.uuid_generate_v4(),
  student_id uuid not null references public.students (id) on delete cascade,
  school_id uuid not null references public.schools (id) on delete cascade,
  allergen varchar(255) not null,
  severity varchar(50),
  notes text,
  created_at timestamptz not null default now()
);

-- STUDENT-007
create table public.student_pickup_persons (
  id uuid primary key default extensions.uuid_generate_v4(),
  student_id uuid not null references public.students (id) on delete cascade,
  school_id uuid not null references public.schools (id) on delete cascade,
  full_name varchar(255) not null,
  phone varchar(50),
  id_number varchar(50),
  relationship varchar(50),
  photo_url text,
  created_at timestamptz not null default now()
);

-- STUDENT-011
create table public.student_timeline (
  id uuid primary key default extensions.uuid_generate_v4(),
  student_id uuid not null references public.students (id) on delete cascade,
  school_id uuid not null references public.schools (id) on delete cascade,
  event_type public.student_timeline_event not null,
  description text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index idx_student_timeline_student on public.student_timeline (student_id, created_at desc);

create trigger students_set_updated_at
  before update on public.students
  for each row execute function public.set_updated_at();

create trigger student_parents_set_updated_at
  before update on public.student_parents
  for each row execute function public.set_updated_at();

-- RLS
alter table public.students enable row level security;
alter table public.student_parents enable row level security;
alter table public.student_emergency_contacts enable row level security;
alter table public.student_medical_records enable row level security;
alter table public.student_allergies enable row level security;
alter table public.student_pickup_persons enable row level security;
alter table public.student_timeline enable row level security;

create policy students_select on public.students
  for select to authenticated
  using (school_id in (select public.get_auth_user_school_ids()));

create policy students_insert on public.students
  for insert to authenticated
  with check (school_id in (select public.get_auth_user_school_ids()));

create policy students_update on public.students
  for update to authenticated
  using (school_id in (select public.get_auth_user_school_ids()));

create policy student_parents_all on public.student_parents
  for all to authenticated
  using (school_id in (select public.get_auth_user_school_ids()))
  with check (school_id in (select public.get_auth_user_school_ids()));

create policy student_emergency_contacts_all on public.student_emergency_contacts
  for all to authenticated
  using (school_id in (select public.get_auth_user_school_ids()))
  with check (school_id in (select public.get_auth_user_school_ids()));

create policy student_medical_records_all on public.student_medical_records
  for all to authenticated
  using (school_id in (select public.get_auth_user_school_ids()))
  with check (school_id in (select public.get_auth_user_school_ids()));

create policy student_allergies_all on public.student_allergies
  for all to authenticated
  using (school_id in (select public.get_auth_user_school_ids()))
  with check (school_id in (select public.get_auth_user_school_ids()));

create policy student_pickup_persons_all on public.student_pickup_persons
  for all to authenticated
  using (school_id in (select public.get_auth_user_school_ids()))
  with check (school_id in (select public.get_auth_user_school_ids()));

create policy student_timeline_select on public.student_timeline
  for select to authenticated
  using (school_id in (select public.get_auth_user_school_ids()));

create policy student_timeline_insert on public.student_timeline
  for insert to authenticated
  with check (school_id in (select public.get_auth_user_school_ids()));

grant select, insert, update on public.students to authenticated, service_role;
grant select, insert, update, delete on public.student_parents to authenticated, service_role;
grant select, insert, update, delete on public.student_emergency_contacts to authenticated, service_role;
grant select, insert, update, delete on public.student_medical_records to authenticated, service_role;
grant select, insert, update, delete on public.student_allergies to authenticated, service_role;
grant select, insert, update, delete on public.student_pickup_persons to authenticated, service_role;
grant select, insert on public.student_timeline to authenticated, service_role;
