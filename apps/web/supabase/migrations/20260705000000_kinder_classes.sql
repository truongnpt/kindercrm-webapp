/*
 * EPIC-005 — Class Management (core)
 */

create type public.class_status as enum ('active', 'archived');

-- CLASS-001 School Year
create table public.school_years (
  id uuid primary key default extensions.uuid_generate_v4(),
  school_id uuid not null references public.schools (id) on delete cascade,
  name varchar(100) not null,
  start_date date not null,
  end_date date not null,
  is_current boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint school_years_school_name_unique unique (school_id, name)
);

-- CLASS-002 Semester
create table public.semesters (
  id uuid primary key default extensions.uuid_generate_v4(),
  school_id uuid not null references public.schools (id) on delete cascade,
  school_year_id uuid not null references public.school_years (id) on delete cascade,
  name varchar(100) not null,
  start_date date not null,
  end_date date not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint semesters_year_name_unique unique (school_year_id, name)
);

-- CLASS-003 Classroom (physical room)
create table public.classrooms (
  id uuid primary key default extensions.uuid_generate_v4(),
  school_id uuid not null references public.schools (id) on delete cascade,
  campus_id uuid references public.campuses (id) on delete set null,
  name varchar(255) not null,
  capacity integer not null default 30,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint classrooms_school_name_unique unique (school_id, name)
);

-- CLASS-004 Create Class
create table public.classes (
  id uuid primary key default extensions.uuid_generate_v4(),
  school_id uuid not null references public.schools (id) on delete cascade,
  campus_id uuid references public.campuses (id) on delete set null,
  school_year_id uuid not null references public.school_years (id) on delete restrict,
  semester_id uuid references public.semesters (id) on delete set null,
  classroom_id uuid references public.classrooms (id) on delete set null,
  name varchar(255) not null,
  code varchar(50) not null,
  capacity integer not null default 25,
  teacher_user_id uuid references auth.users (id) on delete set null,
  status public.class_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint classes_school_code_unique unique (school_id, code)
);

create index idx_classes_school_year on public.classes (school_id, school_year_id)
  where deleted_at is null;

-- CLASS-006 Student assignment
create table public.class_enrollments (
  id uuid primary key default extensions.uuid_generate_v4(),
  school_id uuid not null references public.schools (id) on delete cascade,
  class_id uuid not null references public.classes (id) on delete cascade,
  student_id uuid not null references public.students (id) on delete cascade,
  enrolled_at date not null default current_date,
  status varchar(20) not null default 'active',
  created_at timestamptz not null default now(),
  constraint class_enrollments_unique unique (class_id, student_id)
);

create index idx_class_enrollments_class on public.class_enrollments (class_id)
  where status = 'active';

-- CLASS-008 Timetable (basic slots)
create table public.class_schedules (
  id uuid primary key default extensions.uuid_generate_v4(),
  school_id uuid not null references public.schools (id) on delete cascade,
  class_id uuid not null references public.classes (id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  label varchar(255) not null default 'Hoạt động',
  created_at timestamptz not null default now(),
  constraint class_schedules_class_slot_unique unique (class_id, day_of_week, start_time)
);

-- Link students to current class (CLASS-009 transfer support)
alter table public.students
  add column if not exists current_class_id uuid references public.classes (id) on delete set null;

create index idx_students_current_class on public.students (current_class_id)
  where deleted_at is null;

create trigger school_years_set_updated_at
  before update on public.school_years
  for each row execute function public.set_updated_at();

create trigger semesters_set_updated_at
  before update on public.semesters
  for each row execute function public.set_updated_at();

create trigger classrooms_set_updated_at
  before update on public.classrooms
  for each row execute function public.set_updated_at();

create trigger classes_set_updated_at
  before update on public.classes
  for each row execute function public.set_updated_at();

-- RLS
alter table public.school_years enable row level security;
alter table public.semesters enable row level security;
alter table public.classrooms enable row level security;
alter table public.classes enable row level security;
alter table public.class_enrollments enable row level security;
alter table public.class_schedules enable row level security;

create policy school_years_all on public.school_years
  for all to authenticated
  using (school_id in (select public.get_auth_user_school_ids()))
  with check (
    public.user_has_school_role(school_id, array['owner', 'admin']::public.school_member_role[])
  );

create policy semesters_all on public.semesters
  for all to authenticated
  using (school_id in (select public.get_auth_user_school_ids()))
  with check (school_id in (select public.get_auth_user_school_ids()));

create policy classrooms_all on public.classrooms
  for all to authenticated
  using (school_id in (select public.get_auth_user_school_ids()))
  with check (school_id in (select public.get_auth_user_school_ids()));

create policy classes_select on public.classes
  for select to authenticated
  using (school_id in (select public.get_auth_user_school_ids()));

create policy classes_insert on public.classes
  for insert to authenticated
  with check (school_id in (select public.get_auth_user_school_ids()));

create policy classes_update on public.classes
  for update to authenticated
  using (school_id in (select public.get_auth_user_school_ids()));

create policy class_enrollments_all on public.class_enrollments
  for all to authenticated
  using (school_id in (select public.get_auth_user_school_ids()))
  with check (school_id in (select public.get_auth_user_school_ids()));

create policy class_schedules_all on public.class_schedules
  for all to authenticated
  using (school_id in (select public.get_auth_user_school_ids()))
  with check (school_id in (select public.get_auth_user_school_ids()));

grant select, insert, update on public.school_years to authenticated, service_role;
grant select, insert, update on public.semesters to authenticated, service_role;
grant select, insert, update, delete on public.classrooms to authenticated, service_role;
grant select, insert, update on public.classes to authenticated, service_role;
grant select, insert, update, delete on public.class_enrollments to authenticated, service_role;
grant select, insert, update, delete on public.class_schedules to authenticated, service_role;
