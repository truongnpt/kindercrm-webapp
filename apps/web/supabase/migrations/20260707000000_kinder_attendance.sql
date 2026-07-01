/*
 * EPIC-007 — Attendance (core)
 */

create type public.attendance_status as enum (
  'present',
  'absent',
  'late',
  'excused',
  'early_leave'
);

create type public.leave_request_status as enum (
  'pending',
  'approved',
  'rejected'
);

-- ATT-001/002/004/006/007 Daily attendance
create table public.attendance_records (
  id uuid primary key default extensions.uuid_generate_v4(),
  school_id uuid not null references public.schools (id) on delete cascade,
  student_id uuid not null references public.students (id) on delete cascade,
  class_id uuid references public.classes (id) on delete set null,
  attendance_date date not null,
  status public.attendance_status not null default 'present',
  check_in_at timestamptz,
  check_out_at timestamptz,
  is_late boolean not null default false,
  late_minutes integer not null default 0,
  notes text,
  recorded_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint attendance_records_unique unique (school_id, student_id, attendance_date)
);

create index idx_attendance_records_class_date on public.attendance_records (
  school_id,
  class_id,
  attendance_date
);

create index idx_attendance_records_date on public.attendance_records (
  school_id,
  attendance_date
);

-- ATT-005 Leave request
create table public.leave_requests (
  id uuid primary key default extensions.uuid_generate_v4(),
  school_id uuid not null references public.schools (id) on delete cascade,
  student_id uuid not null references public.students (id) on delete cascade,
  start_date date not null,
  end_date date not null,
  reason text,
  status public.leave_request_status not null default 'pending',
  reviewed_by uuid references auth.users (id) on delete set null,
  reviewed_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_leave_requests_school_status on public.leave_requests (
  school_id,
  status
);

create trigger attendance_records_set_updated_at
  before update on public.attendance_records
  for each row execute function public.set_updated_at();

create trigger leave_requests_set_updated_at
  before update on public.leave_requests
  for each row execute function public.set_updated_at();

-- RLS
alter table public.attendance_records enable row level security;
alter table public.leave_requests enable row level security;

create policy attendance_records_all on public.attendance_records
  for all to authenticated
  using (school_id in (select public.get_auth_user_school_ids()))
  with check (school_id in (select public.get_auth_user_school_ids()));

create policy leave_requests_all on public.leave_requests
  for all to authenticated
  using (school_id in (select public.get_auth_user_school_ids()))
  with check (school_id in (select public.get_auth_user_school_ids()));

grant select, insert, update on public.attendance_records to authenticated, service_role;
grant select, insert, update on public.leave_requests to authenticated, service_role;
