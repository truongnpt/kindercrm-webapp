/*
 * EPIC-011 — Daily report media storage (DAILY-009/010/015)
 */

do $daily_report_media_storage$
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
  values ('daily_report_media', 'daily_report_media', true, 52428800)
  on conflict (id) do nothing;

  create or replace function public.user_can_access_daily_report_media(object_name text)
  returns boolean
  language sql
  stable
  security definer
  set search_path = ''
  as $fn$
    select exists (
      select 1
      from public.student_daily_reports r
      where r.id = (storage.foldername(object_name))[2]::uuid
        and (
          r.school_id in (select public.get_auth_user_school_ids())
          or r.student_id in (select public.get_auth_user_parent_student_ids())
        )
    );
  $fn$;

  grant execute on function public.user_can_access_daily_report_media(text)
    to authenticated, service_role;

  drop policy if exists daily_report_media_select on storage.objects;
  drop policy if exists daily_report_media_staff_insert on storage.objects;
  drop policy if exists daily_report_media_staff_delete on storage.objects;

  create policy daily_report_media_select on storage.objects
    for select to authenticated
    using (
      bucket_id = 'daily_report_media'
      and public.user_can_access_daily_report_media(name)
    );

  create policy daily_report_media_staff_insert on storage.objects
    for insert to authenticated
    with check (
      bucket_id = 'daily_report_media'
      and (storage.foldername(name))[1]::uuid in (
        select public.get_auth_user_school_ids()
      )
    );

  create policy daily_report_media_staff_delete on storage.objects
    for delete to authenticated
    using (
      bucket_id = 'daily_report_media'
      and (storage.foldername(name))[1]::uuid in (
        select public.get_auth_user_school_ids()
      )
    );
end $daily_report_media_storage$;

alter table public.daily_report_attachments
  add column if not exists file_size bigint,
  add column if not exists mime_type varchar(100);
