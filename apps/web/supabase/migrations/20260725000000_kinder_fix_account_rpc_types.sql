/*
 * Fix 42804 datatype mismatch in account lookup RPCs.
 * accounts.email/name are varchar; RETURNS TABLE declares text.
 * PostgREST also passes user id filters more reliably as text[].
 */

-- Remove uuid[] overload so PostgREST can resolve a single RPC signature (PGRST203).
drop function if exists public.get_school_member_accounts(uuid, uuid[]);

create or replace function public.find_account_by_email_for_school(
  p_school_id uuid,
  p_email text
)
returns table (
  id uuid,
  email text,
  name text
)
language plpgsql
security definer
stable
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if not public.user_has_school_role(
    p_school_id,
    array['owner', 'admin', 'staff']::public.school_member_role[]
  ) then
    raise exception 'SCHOOL_ACCESS_DENIED' using errcode = 'P0001';
  end if;

  return query
  select a.id, a.email::text, a.name::text
  from public.accounts a
  where a.email is not null
    and lower(a.email) = lower(trim(p_email))
  limit 1;
end;
$$;

create or replace function public.get_school_member_accounts(
  p_school_id uuid,
  p_user_ids text[] default null
)
returns table (
  id uuid,
  email text,
  name text
)
language plpgsql
security definer
stable
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if not public.user_has_school_role(
    p_school_id,
    array['owner', 'admin', 'staff']::public.school_member_role[]
  ) then
    raise exception 'SCHOOL_ACCESS_DENIED' using errcode = 'P0001';
  end if;

  return query
  select distinct a.id, a.email::text, a.name::text
  from public.accounts a
  inner join (
    select sm.user_id
    from public.school_members sm
    where sm.school_id = p_school_id
      and sm.deleted_at is null
    union
    select psl.user_id
    from public.parent_student_links psl
    where psl.school_id = p_school_id
  ) scoped on scoped.user_id = a.id
  where p_user_ids is null
    or a.id::text = any (p_user_ids);
end;
$$;

revoke all on function public.get_school_member_accounts(uuid, text[]) from public;

grant execute on function public.get_school_member_accounts(uuid, text[])
  to authenticated, service_role;

grant execute on function public.find_account_by_email_for_school(uuid, text)
  to authenticated, service_role;
