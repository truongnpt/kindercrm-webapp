/*
 * EPIC-017 — Calendar Management (Phase 1: school-scoped events)
 */

create type public.calendar_event_category as enum (
  'learning_activity',
  'event',
  'holiday',
  'parent_meeting',
  'health_checkup',
  'other'
);

create type public.calendar_event_scope as enum (
  'school',
  'campus',
  'class'
);

create table public.calendar_events (
  id uuid primary key default extensions.uuid_generate_v4(),
  school_id uuid not null references public.schools (id) on delete cascade,
  title varchar(255) not null,
  description text,
  category public.calendar_event_category not null default 'event',
  scope_type public.calendar_event_scope not null default 'school',
  campus_id uuid references public.campuses (id) on delete set null,
  class_id uuid references public.classes (id) on delete set null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  all_day boolean not null default false,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint calendar_events_range check (ends_at >= starts_at)
);

create index idx_calendar_events_school_starts
  on public.calendar_events (school_id, starts_at)
  where deleted_at is null;

create index idx_calendar_events_school_class
  on public.calendar_events (school_id, class_id)
  where deleted_at is null and class_id is not null;

create trigger calendar_events_set_updated_at
  before update on public.calendar_events
  for each row execute function public.set_updated_at();

alter table public.calendar_events enable row level security;

create policy calendar_events_staff_all on public.calendar_events
  for all to authenticated
  using (school_id in (select public.get_auth_user_school_ids()))
  with check (school_id in (select public.get_auth_user_school_ids()));

grant select, insert, update on public.calendar_events to authenticated, service_role;

-- Grant calendar permissions to admin/manager for existing schools
insert into public.school_role_permissions (school_id, role, permission, granted)
select s.id, 'admin'::public.school_member_role, p.permission, true
from public.schools s
cross join (
  values
    ('calendar.events.view'),
    ('calendar.events.manage')
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
    ('calendar.events.view', true),
    ('calendar.events.manage', true)
) as p(permission, granted)
where s.deleted_at is null
on conflict (school_id, role, permission)
  where custom_role_id is null and role is not null
do update set granted = excluded.granted, updated_at = now();

insert into public.school_role_permissions (school_id, role, permission, granted)
select s.id, 'staff'::public.school_member_role, 'calendar.events.view', true
from public.schools s
where s.deleted_at is null
on conflict (school_id, role, permission)
  where custom_role_id is null and role is not null
do update set granted = true, updated_at = now();
