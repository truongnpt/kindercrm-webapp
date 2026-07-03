/*
 * EPIC-023 Communication Center — parent ↔ school chat (PARENT-009)
 */

create type public.communication_channel as enum ('homeroom', 'school_office');

create table public.communication_threads (
  id uuid primary key default extensions.uuid_generate_v4(),
  school_id uuid not null references public.schools (id) on delete cascade,
  student_id uuid not null references public.students (id) on delete cascade,
  channel public.communication_channel not null,
  class_id uuid references public.classes (id) on delete set null,
  last_message_at timestamptz,
  last_message_preview text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint communication_threads_unique unique (school_id, student_id, channel)
);

create index idx_communication_threads_school_updated
  on public.communication_threads (school_id, last_message_at desc nulls last);

create index idx_communication_threads_student
  on public.communication_threads (student_id);

create table public.communication_messages (
  id uuid primary key default extensions.uuid_generate_v4(),
  school_id uuid not null references public.schools (id) on delete cascade,
  thread_id uuid not null references public.communication_threads (id) on delete cascade,
  sender_user_id uuid not null references auth.users (id) on delete cascade,
  sender_type text not null check (sender_type in ('parent', 'staff')),
  body text not null,
  attachment_storage_path text,
  attachment_file_name text,
  attachment_mime_type text,
  created_at timestamptz not null default now()
);

create index idx_communication_messages_thread
  on public.communication_messages (thread_id, created_at);

create table public.communication_thread_reads (
  thread_id uuid not null references public.communication_threads (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  last_read_at timestamptz not null default now(),
  primary key (thread_id, user_id)
);

create trigger communication_threads_set_updated_at
  before update on public.communication_threads
  for each row execute function public.set_updated_at();

alter table public.communication_threads enable row level security;
alter table public.communication_messages enable row level security;
alter table public.communication_thread_reads enable row level security;

-- Staff: full access within their schools
create policy communication_threads_staff_all on public.communication_threads
  for all to authenticated
  using (school_id in (select public.get_auth_user_school_ids()))
  with check (school_id in (select public.get_auth_user_school_ids()));

create policy communication_messages_staff_all on public.communication_messages
  for all to authenticated
  using (school_id in (select public.get_auth_user_school_ids()))
  with check (school_id in (select public.get_auth_user_school_ids()));

create policy communication_thread_reads_staff_all on public.communication_thread_reads
  for all to authenticated
  using (
    exists (
      select 1
      from public.communication_threads t
      where t.id = communication_thread_reads.thread_id
        and t.school_id in (select public.get_auth_user_school_ids())
    )
  )
  with check (
    exists (
      select 1
      from public.communication_threads t
      where t.id = communication_thread_reads.thread_id
        and t.school_id in (select public.get_auth_user_school_ids())
    )
  );

-- Parents: read/write threads for linked students
create policy communication_threads_parent_select on public.communication_threads
  for select to authenticated
  using (
    exists (
      select 1
      from public.parent_student_links psl
      where psl.user_id = auth.uid()
        and psl.school_id = communication_threads.school_id
        and psl.student_id = communication_threads.student_id
    )
  );

create policy communication_threads_parent_insert on public.communication_threads
  for insert to authenticated
  with check (
    exists (
      select 1
      from public.parent_student_links psl
      where psl.user_id = auth.uid()
        and psl.school_id = communication_threads.school_id
        and psl.student_id = communication_threads.student_id
    )
  );

create policy communication_messages_parent_select on public.communication_messages
  for select to authenticated
  using (
    exists (
      select 1
      from public.communication_threads t
      inner join public.parent_student_links psl
        on psl.student_id = t.student_id
        and psl.school_id = t.school_id
      where t.id = communication_messages.thread_id
        and psl.user_id = auth.uid()
    )
  );

create policy communication_messages_parent_insert on public.communication_messages
  for insert to authenticated
  with check (
    sender_user_id = auth.uid()
    and sender_type = 'parent'
    and exists (
      select 1
      from public.communication_threads t
      inner join public.parent_student_links psl
        on psl.student_id = t.student_id
        and psl.school_id = t.school_id
      where t.id = communication_messages.thread_id
        and psl.user_id = auth.uid()
    )
  );

create policy communication_thread_reads_parent on public.communication_thread_reads
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

grant select, insert, update, delete on public.communication_threads to authenticated, service_role;
grant select, insert, update, delete on public.communication_messages to authenticated, service_role;
grant select, insert, update, delete on public.communication_thread_reads to authenticated, service_role;

alter type public.notification_category add value if not exists 'communication';

insert into public.school_role_permissions (school_id, role, permission, granted)
select s.id, 'admin'::public.school_member_role, p.permission, true
from public.schools s
cross join (
  values
    ('communication.messages.view'),
    ('communication.messages.manage')
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
    ('communication.messages.view', true),
    ('communication.messages.manage', true)
) as p(permission, granted)
where s.deleted_at is null
on conflict (school_id, role, permission)
  where custom_role_id is null and role is not null
do update set granted = excluded.granted, updated_at = now();

insert into public.school_role_permissions (school_id, role, permission, granted)
select s.id, 'teacher'::public.school_member_role, p.permission, p.granted
from public.schools s
cross join (
  values
    ('communication.messages.view', true),
    ('communication.messages.manage', true)
) as p(permission, granted)
where s.deleted_at is null
on conflict (school_id, role, permission)
  where custom_role_id is null and role is not null
do update set granted = excluded.granted, updated_at = now();

insert into public.school_role_permissions (school_id, role, permission, granted)
select s.id, 'staff'::public.school_member_role, 'communication.messages.view', true
from public.schools s
where s.deleted_at is null
on conflict (school_id, role, permission)
  where custom_role_id is null and role is not null
do update set granted = true, updated_at = now();
