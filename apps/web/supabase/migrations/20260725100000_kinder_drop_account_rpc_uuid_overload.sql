/*
 * PostgREST PGRST203: drop legacy uuid[] overload left after 20260725000000.
 */

drop function if exists public.get_school_member_accounts(uuid, uuid[]);

grant execute on function public.get_school_member_accounts(uuid, text[])
  to authenticated, service_role;
