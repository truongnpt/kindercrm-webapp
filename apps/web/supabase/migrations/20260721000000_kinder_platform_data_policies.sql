/*
 * Platform admins — cross-tenant read/update for console (authenticated + RLS)
 * Avoids requiring service role for platform list/dashboard queries.
 */

create policy schools_platform_admin_select on public.schools
  for select to authenticated
  using (
    public.is_platform_admin(
      array['super_admin', 'support']::public.platform_admin_role[]
    )
  );

create policy schools_platform_admin_update on public.schools
  for update to authenticated
  using (
    public.is_platform_admin(
      array['super_admin', 'support']::public.platform_admin_role[]
    )
  )
  with check (
    public.is_platform_admin(
      array['super_admin', 'support']::public.platform_admin_role[]
    )
  );

create policy school_subscriptions_platform_admin_select on public.school_subscriptions
  for select to authenticated
  using (
    public.is_platform_admin(
      array['super_admin', 'support', 'billing']::public.platform_admin_role[]
    )
  );

create policy school_subscriptions_platform_admin_update on public.school_subscriptions
  for update to authenticated
  using (
    public.is_platform_admin(
      array['super_admin', 'support', 'billing']::public.platform_admin_role[]
    )
  )
  with check (
    public.is_platform_admin(
      array['super_admin', 'support', 'billing']::public.platform_admin_role[]
    )
  );

create policy packages_platform_admin_select on public.packages
  for select to authenticated
  using (
    public.is_platform_admin(
      array['super_admin', 'billing']::public.platform_admin_role[]
    )
  );

create policy students_platform_admin_select on public.students
  for select to authenticated
  using (
    public.is_platform_admin(
      array['super_admin', 'support']::public.platform_admin_role[]
    )
  );

create policy campuses_platform_admin_select on public.campuses
  for select to authenticated
  using (
    public.is_platform_admin(
      array['super_admin', 'support']::public.platform_admin_role[]
    )
  );

create policy school_members_platform_admin_select on public.school_members
  for select to authenticated
  using (
    public.is_platform_admin(
      array['super_admin', 'support']::public.platform_admin_role[]
    )
  );

create policy accounts_platform_admin_select on public.accounts
  for select to authenticated
  using (
    public.is_platform_admin(
      array['super_admin', 'support']::public.platform_admin_role[]
    )
  );
