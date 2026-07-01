/*
 * EPIC-009 — Parent Portal (core)
 */

alter type public.school_member_role add value if not exists 'parent';

-- PARENT-001 Link parent auth user to student
create table public.parent_student_links (
  id uuid primary key default extensions.uuid_generate_v4(),
  school_id uuid not null references public.schools (id) on delete cascade,
  student_id uuid not null references public.students (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  student_parent_id uuid references public.student_parents (id) on delete set null,
  relationship varchar(50) not null default 'guardian',
  is_primary boolean not null default false,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint parent_student_links_unique unique (school_id, student_id, user_id)
);

create index idx_parent_student_links_user on public.parent_student_links (user_id);

create index idx_parent_student_links_student on public.parent_student_links (student_id);

-- PARENT-003 Daily report
create table public.student_daily_reports (
  id uuid primary key default extensions.uuid_generate_v4(),
  school_id uuid not null references public.schools (id) on delete cascade,
  student_id uuid not null references public.students (id) on delete cascade,
  report_date date not null default current_date,
  mood varchar(50),
  meals text,
  nap text,
  activities text,
  teacher_note text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint student_daily_reports_unique unique (school_id, student_id, report_date)
);

create trigger student_daily_reports_set_updated_at
  before update on public.student_daily_reports
  for each row execute function public.set_updated_at();

-- Helper for parent RLS
create or replace function public.get_auth_user_parent_student_ids()
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select student_id
  from public.parent_student_links
  where user_id = auth.uid();
$$;

grant execute on function public.get_auth_user_parent_student_ids() to authenticated, service_role;

-- RLS
alter table public.parent_student_links enable row level security;
alter table public.student_daily_reports enable row level security;

create policy parent_student_links_staff on public.parent_student_links
  for all to authenticated
  using (school_id in (select public.get_auth_user_school_ids()))
  with check (
    public.user_has_school_role(school_id, array['owner', 'admin', 'staff']::public.school_member_role[])
  );

create policy parent_student_links_parent_select on public.parent_student_links
  for select to authenticated
  using (user_id = auth.uid());

create policy student_daily_reports_staff on public.student_daily_reports
  for all to authenticated
  using (school_id in (select public.get_auth_user_school_ids()))
  with check (school_id in (select public.get_auth_user_school_ids()));

create policy student_daily_reports_parent_select on public.student_daily_reports
  for select to authenticated
  using (student_id in (select public.get_auth_user_parent_student_ids()));

-- Parent read access to linked student data
create policy students_parent_select on public.students
  for select to authenticated
  using (id in (select public.get_auth_user_parent_student_ids()));

create policy attendance_records_parent_select on public.attendance_records
  for select to authenticated
  using (student_id in (select public.get_auth_user_parent_student_ids()));

create policy invoices_parent_select on public.invoices
  for select to authenticated
  using (student_id in (select public.get_auth_user_parent_student_ids()));

create policy invoice_payments_parent_select on public.invoice_payments
  for select to authenticated
  using (
    invoice_id in (
      select id from public.invoices
      where student_id in (select public.get_auth_user_parent_student_ids())
    )
  );

grant select, insert, update, delete on public.parent_student_links to authenticated, service_role;
grant select, insert, update on public.student_daily_reports to authenticated, service_role;
