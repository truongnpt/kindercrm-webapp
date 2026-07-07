/*
 * SUB-022 — Platform admins can read SaaS billing invoices for analytics
 */

create policy saas_billing_invoices_platform_admin_select
  on public.saas_billing_invoices
  for select to authenticated
  using (
    public.is_platform_admin(
      array['super_admin', 'support', 'billing']::public.platform_admin_role[]
    )
  );
