/*
 * Student profile photo storage
 */

do $student_photos_storage$
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
  values ('student_photos', 'student_photos', true, 5242880)
  on conflict (id) do nothing;

  create or replace function public.user_can_access_student_photo(object_name text)
  returns boolean
  language sql
  stable
  security definer
  set search_path = ''
  as $fn$
    select exists (
      select 1
      from public.students s
      where s.id = (storage.foldername(object_name))[2]::uuid
        and s.school_id = (storage.foldername(object_name))[1]::uuid
        and s.deleted_at is null
        and (
          s.school_id in (select public.get_auth_user_school_ids())
          or s.id in (select public.get_auth_user_parent_student_ids())
        )
    );
  $fn$;

  grant execute on function public.user_can_access_student_photo(text)
    to authenticated, service_role;

  drop policy if exists student_photos_select on storage.objects;
  drop policy if exists student_photos_staff_insert on storage.objects;
  drop policy if exists student_photos_staff_update on storage.objects;
  drop policy if exists student_photos_staff_delete on storage.objects;

  create policy student_photos_select on storage.objects
    for select to authenticated
    using (
      bucket_id = 'student_photos'
      and public.user_can_access_student_photo(name)
    );

  create policy student_photos_staff_insert on storage.objects
    for insert to authenticated
    with check (
      bucket_id = 'student_photos'
      and (storage.foldername(name))[1]::uuid in (
        select public.get_auth_user_school_ids()
      )
      and exists (
        select 1
        from public.students s
        where s.id = (storage.foldername(name))[2]::uuid
          and s.school_id = (storage.foldername(name))[1]::uuid
          and s.deleted_at is null
      )
    );

  create policy student_photos_staff_update on storage.objects
    for update to authenticated
    using (
      bucket_id = 'student_photos'
      and (storage.foldername(name))[1]::uuid in (
        select public.get_auth_user_school_ids()
      )
    )
    with check (
      bucket_id = 'student_photos'
      and (storage.foldername(name))[1]::uuid in (
        select public.get_auth_user_school_ids()
      )
    );

  create policy student_photos_staff_delete on storage.objects
    for delete to authenticated
    using (
      bucket_id = 'student_photos'
      and (storage.foldername(name))[1]::uuid in (
        select public.get_auth_user_school_ids()
      )
    );
end $student_photos_storage$;
