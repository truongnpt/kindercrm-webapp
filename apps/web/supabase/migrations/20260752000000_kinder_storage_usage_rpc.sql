/*
 * SUB-009: School storage usage from Supabase Storage objects.
 */

create or replace function public.get_school_storage_usage_bytes(p_school_id uuid)
returns bigint
language plpgsql
security definer
set search_path = ''
stable
as $$
declare
  v_bytes bigint;
begin
  if auth.uid() is not null and not exists (
    select 1
    from public.school_members sm
    where sm.school_id = p_school_id
      and sm.user_id = auth.uid()
      and sm.deleted_at is null
  ) then
    raise exception 'SCHOOL_ACCESS_DENIED' using errcode = 'P0001';
  end if;

  select coalesce(sum((o.metadata->>'size')::bigint), 0)::bigint
  into v_bytes
  from storage.objects o
  where o.bucket_id in ('student_photos', 'daily_report_media')
    and o.name like p_school_id::text || '/%';

  return v_bytes;
end;
$$;

comment on function public.get_school_storage_usage_bytes(uuid) is
  'Total bytes in school-scoped storage paths (student photos + daily report media + logos).';

grant execute on function public.get_school_storage_usage_bytes(uuid) to authenticated, service_role;
