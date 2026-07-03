/*
 * Parent portal read access for student contracts (linked children only).
 * Parents see active, expired, and terminated contracts — not drafts or cancelled.
 */

create policy student_contracts_parent_select on public.student_contracts
  for select to authenticated
  using (
    student_id in (select public.get_auth_user_parent_student_ids())
    and status in ('active', 'expired', 'terminated')
  );
