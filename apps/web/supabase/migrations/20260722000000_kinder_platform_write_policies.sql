/*
 * Platform admins — write policies for console mutations (no service role required)
 */

create policy packages_platform_admin_insert on public.packages
  for insert to authenticated
  with check (
    public.is_platform_admin(
      array['super_admin', 'billing']::public.platform_admin_role[]
    )
  );

create policy packages_platform_admin_update on public.packages
  for update to authenticated
  using (
    public.is_platform_admin(
      array['super_admin', 'billing']::public.platform_admin_role[]
    )
  )
  with check (
    public.is_platform_admin(
      array['super_admin', 'billing']::public.platform_admin_role[]
    )
  );

create policy school_subscriptions_platform_admin_insert on public.school_subscriptions
  for insert to authenticated
  with check (
    public.is_platform_admin(
      array['super_admin', 'support', 'billing']::public.platform_admin_role[]
    )
  );

create policy school_subscription_history_platform_admin_insert
  on public.school_subscription_history
  for insert to authenticated
  with check (
    public.is_platform_admin(
      array['super_admin', 'support', 'billing']::public.platform_admin_role[]
    )
  );

create policy school_subscription_history_platform_admin_select
  on public.school_subscription_history
  for select to authenticated
  using (
    public.is_platform_admin(
      array['super_admin', 'support', 'billing']::public.platform_admin_role[]
    )
  );

create policy platform_audit_logs_insert on public.platform_audit_logs
  for insert to authenticated
  with check (
    actor_user_id = auth.uid()
    and public.is_platform_admin(
      array['super_admin', 'support', 'billing']::public.platform_admin_role[]
    )
  );

-- Grant admin lookup by email (super_admin only)
create policy accounts_platform_super_admin_select on public.accounts
  for select to authenticated
  using (
    public.is_platform_admin(array['super_admin']::public.platform_admin_role[])
  );
