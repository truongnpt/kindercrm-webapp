/*
 * Communication chat image attachments storage.
 */

do $communication_media_storage$
begin
  if not exists (
    select 1
    from information_schema.tables
    where table_schema = 'storage'
      and table_name = 'buckets'
  ) then
    return;
  end if;

  insert into storage.buckets (id, name, public, file_size_limit)
  values ('communication_media', 'communication_media', true, 15728640)
  on conflict (id) do nothing;

  create or replace function public.user_can_access_communication_media(object_name text)
  returns boolean
  language sql
  stable
  security definer
  set search_path = ''
  as $fn$
    select exists (
      select 1
      from public.communication_threads t
      where t.school_id = (storage.foldername(object_name))[1]::uuid
        and t.id = (storage.foldername(object_name))[2]::uuid
        and (
          t.school_id in (select public.get_auth_user_school_ids())
          or exists (
            select 1
            from public.parent_student_links psl
            where psl.user_id = auth.uid()
              and psl.school_id = t.school_id
              and psl.student_id = t.student_id
          )
        )
    );
  $fn$;

  grant execute on function public.user_can_access_communication_media(text)
    to authenticated, service_role;

  drop policy if exists communication_media_select on storage.objects;
  drop policy if exists communication_media_insert on storage.objects;

  create policy communication_media_select on storage.objects
    for select to authenticated
    using (
      bucket_id = 'communication_media'
      and public.user_can_access_communication_media(name)
    );

  create policy communication_media_insert on storage.objects
    for insert to authenticated
    with check (
      bucket_id = 'communication_media'
      and public.user_can_access_communication_media(name)
    );
end $communication_media_storage$;
