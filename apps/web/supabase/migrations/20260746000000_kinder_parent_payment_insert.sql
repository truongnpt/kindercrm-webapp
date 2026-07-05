/*
 * Allow parents to submit invoice payments for linked students.
 */

create policy invoice_payments_parent_insert on public.invoice_payments
  for insert to authenticated
  with check (
    submitted_by = auth.uid()
    and status = 'waiting_verification'
    and school_id in (
      select psl.school_id
      from public.parent_student_links psl
      where psl.user_id = auth.uid()
    )
    and invoice_id in (
      select i.id
      from public.invoices i
      where i.student_id in (select public.get_auth_user_parent_student_ids())
        and i.school_id = invoice_payments.school_id
    )
  );
