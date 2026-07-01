/*
 * RLS helper functions — operations that need cross-row or cross-tenant visibility
 * without service role (school onboarding, staff/parent account linking, etc.)
 */

-- Global slug check (RLS on schools only exposes member schools)
create or replace function public.is_school_slug_available(p_slug text)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select not exists (
    select 1
    from public.schools s
    where s.slug = p_slug
      and s.deleted_at is null
  );
$$;

revoke all on function public.is_school_slug_available(text) from public;
grant execute on function public.is_school_slug_available(text)
  to authenticated, service_role;

-- Staff lookup of registered account by email (link parent / grant staff access)
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
  select a.id, a.email, a.name
  from public.accounts a
  where a.email is not null
    and lower(a.email) = lower(trim(p_email))
  limit 1;
end;
$$;

revoke all on function public.find_account_by_email_for_school(uuid, text) from public;
grant execute on function public.find_account_by_email_for_school(uuid, text)
  to authenticated, service_role;

-- Staff read account display info for school members and linked parents
create or replace function public.get_school_member_accounts(
  p_school_id uuid,
  p_user_ids uuid[] default null
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
  select distinct a.id, a.email, a.name
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
  where p_user_ids is null or a.id = any (p_user_ids);
end;
$$;

revoke all on function public.get_school_member_accounts(uuid, uuid[]) from public;
grant execute on function public.get_school_member_accounts(uuid, uuid[])
  to authenticated, service_role;
