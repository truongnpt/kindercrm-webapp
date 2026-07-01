/*
 * EPIC-011 Phase 3 — In-app notifications (DAILY-006 foundation)
 */

create type public.notification_category as enum (
  'daily_report',
  'menu',
  'inventory',
  'system'
);

create table public.user_notifications (
  id uuid primary key default extensions.uuid_generate_v4(),
  school_id uuid not null references public.schools (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  category public.notification_category not null default 'system',
  title varchar(200) not null,
  body text,
  link_url text,
  reference_type varchar(50),
  reference_id uuid,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_user_notifications_user on public.user_notifications (user_id, created_at desc);
create index idx_user_notifications_unread on public.user_notifications (user_id) where read_at is null;

alter table public.user_notifications enable row level security;

create policy user_notifications_own on public.user_notifications
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

grant select, insert, update, delete on public.user_notifications to authenticated, service_role;

alter table public.daily_report_attachments
  add column if not exists thumbnail_path text;
