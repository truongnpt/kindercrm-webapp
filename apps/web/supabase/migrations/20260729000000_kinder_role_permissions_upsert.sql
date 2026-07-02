/*
 * Bulk upsert for school_role_permissions.
 * PostgREST upsert cannot target partial unique indexes
 * (school_role_permissions_system_unique / _custom_unique).
 */

create or replace function public.upsert_school_role_permission_grants(
  p_school_id uuid,
  p_grants jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  item jsonb;
  v_role public.school_member_role;
  v_custom_role_id uuid;
  v_permission text;
  v_granted boolean;
begin
  if not public.user_has_school_permission(p_school_id, 'staff.permissions.manage') then
    raise exception 'permission denied' using errcode = '42501';
  end if;

  for item in select * from jsonb_array_elements(p_grants)
  loop
    v_permission := item->>'permission';
    v_granted := coalesce((item->>'granted')::boolean, false);
    v_custom_role_id := nullif(item->>'custom_role_id', '')::uuid;

    if v_custom_role_id is not null then
      insert into public.school_role_permissions (
        school_id,
        role,
        custom_role_id,
        permission,
        granted
      )
      values (
        p_school_id,
        null,
        v_custom_role_id,
        v_permission,
        v_granted
      )
      on conflict (school_id, custom_role_id, permission)
        where custom_role_id is not null
      do update
        set granted = excluded.granted,
            updated_at = now();
    else
      v_role := (item->>'role')::public.school_member_role;

      insert into public.school_role_permissions (
        school_id,
        role,
        custom_role_id,
        permission,
        granted
      )
      values (
        p_school_id,
        v_role,
        null,
        v_permission,
        v_granted
      )
      on conflict (school_id, role, permission)
        where custom_role_id is null and role is not null
      do update
        set granted = excluded.granted,
            updated_at = now();
    end if;
  end loop;
end;
$$;

grant execute on function public.upsert_school_role_permission_grants(uuid, jsonb)
  to authenticated, service_role;
