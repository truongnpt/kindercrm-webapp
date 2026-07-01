/*
 * EPIC-011 — Daily Report (Nhật ký hằng ngày)
 */

create type public.daily_report_status as enum ('draft', 'published');

alter table public.student_daily_reports
  add column if not exists status public.daily_report_status not null default 'draft',
  add column if not exists daily_summary text,
  add column if not exists parent_acknowledged_at timestamptz,
  add column if not exists published_at timestamptz,
  add column if not exists meal_records jsonb not null default '[]'::jsonb,
  add column if not exists sleep_record jsonb,
  add column if not exists toilet_records jsonb not null default '[]'::jsonb,
  add column if not exists health_observation jsonb,
  add column if not exists medication_records jsonb not null default '[]'::jsonb,
  add column if not exists learning_activities jsonb not null default '[]'::jsonb;

create table public.daily_report_timeline_entries (
  id uuid primary key default extensions.uuid_generate_v4(),
  school_id uuid not null references public.schools (id) on delete cascade,
  report_id uuid not null references public.student_daily_reports (id) on delete cascade,
  entry_type varchar(50) not null,
  title varchar(200) not null,
  content text,
  recorded_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index idx_daily_report_timeline_report on public.daily_report_timeline_entries (report_id);

create table public.daily_report_attachments (
  id uuid primary key default extensions.uuid_generate_v4(),
  school_id uuid not null references public.schools (id) on delete cascade,
  report_id uuid not null references public.student_daily_reports (id) on delete cascade,
  storage_path text not null,
  file_name varchar(255) not null,
  media_type varchar(20) not null default 'photo',
  caption text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index idx_daily_report_attachments_report on public.daily_report_attachments (report_id);

alter table public.daily_report_timeline_entries enable row level security;
alter table public.daily_report_attachments enable row level security;

create policy daily_report_timeline_staff on public.daily_report_timeline_entries
  for all to authenticated
  using (school_id in (select public.get_auth_user_school_ids()))
  with check (school_id in (select public.get_auth_user_school_ids()));

create policy daily_report_timeline_parent_select on public.daily_report_timeline_entries
  for select to authenticated
  using (
    report_id in (
      select id from public.student_daily_reports
      where student_id in (select public.get_auth_user_parent_student_ids())
    )
  );

create policy daily_report_attachments_staff on public.daily_report_attachments
  for all to authenticated
  using (school_id in (select public.get_auth_user_school_ids()))
  with check (school_id in (select public.get_auth_user_school_ids()));

create policy daily_report_attachments_parent_select on public.daily_report_attachments
  for select to authenticated
  using (
    report_id in (
      select id from public.student_daily_reports
      where student_id in (select public.get_auth_user_parent_student_ids())
    )
  );

grant select, insert, update, delete on public.daily_report_timeline_entries to authenticated, service_role;
grant select, insert, update, delete on public.daily_report_attachments to authenticated, service_role;
