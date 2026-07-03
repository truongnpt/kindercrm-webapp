/*
 * Message reactions for parent ↔ school chat.
 */

create type public.communication_reaction as enum (
  'like',
  'love',
  'haha',
  'wow',
  'sad',
  'thanks'
);

create table public.communication_message_reactions (
  id uuid primary key default extensions.uuid_generate_v4(),
  message_id uuid not null references public.communication_messages (id) on delete cascade,
  school_id uuid not null references public.schools (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  reaction public.communication_reaction not null,
  created_at timestamptz not null default now(),
  constraint communication_message_reactions_unique unique (message_id, user_id)
);

create index idx_communication_message_reactions_message
  on public.communication_message_reactions (message_id);

alter table public.communication_message_reactions replica identity full;

alter table public.communication_message_reactions enable row level security;

create policy communication_message_reactions_staff_all
  on public.communication_message_reactions
  for all to authenticated
  using (school_id in (select public.get_auth_user_school_ids()))
  with check (
    school_id in (select public.get_auth_user_school_ids())
    and user_id = auth.uid()
  );

create policy communication_message_reactions_parent_select
  on public.communication_message_reactions
  for select to authenticated
  using (
    exists (
      select 1
      from public.communication_messages m
      inner join public.communication_threads t on t.id = m.thread_id
      inner join public.parent_student_links psl
        on psl.student_id = t.student_id
        and psl.school_id = t.school_id
      where m.id = communication_message_reactions.message_id
        and psl.user_id = auth.uid()
    )
  );

create policy communication_message_reactions_parent_insert
  on public.communication_message_reactions
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.communication_messages m
      inner join public.communication_threads t on t.id = m.thread_id
      inner join public.parent_student_links psl
        on psl.student_id = t.student_id
        and psl.school_id = t.school_id
      where m.id = communication_message_reactions.message_id
        and psl.user_id = auth.uid()
    )
  );

create policy communication_message_reactions_parent_delete
  on public.communication_message_reactions
  for delete to authenticated
  using (
    user_id = auth.uid()
    and exists (
      select 1
      from public.communication_messages m
      inner join public.communication_threads t on t.id = m.thread_id
      inner join public.parent_student_links psl
        on psl.student_id = t.student_id
        and psl.school_id = t.school_id
      where m.id = communication_message_reactions.message_id
        and psl.user_id = auth.uid()
    )
  );

create policy communication_message_reactions_parent_update
  on public.communication_message_reactions
  for update to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.communication_messages m
      inner join public.communication_threads t on t.id = m.thread_id
      inner join public.parent_student_links psl
        on psl.student_id = t.student_id
        and psl.school_id = t.school_id
      where m.id = communication_message_reactions.message_id
        and psl.user_id = auth.uid()
    )
  );

grant select, insert, update, delete on public.communication_message_reactions
  to authenticated, service_role;

alter publication supabase_realtime add table public.communication_message_reactions;
