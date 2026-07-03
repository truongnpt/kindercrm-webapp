/*
 * Parent portal — scoped RLS for leave requests and student contacts
 */

drop policy if exists leave_requests_all on public.leave_requests;

create policy leave_requests_staff on public.leave_requests
  for all to authenticated
  using (
    school_id in (select public.get_auth_user_school_ids())
    and public.user_has_school_role(
      school_id,
      array['owner', 'admin', 'manager', 'staff']::public.school_member_role[]
    )
  )
  with check (
    school_id in (select public.get_auth_user_school_ids())
    and public.user_has_school_role(
      school_id,
      array['owner', 'admin', 'manager', 'staff']::public.school_member_role[]
    )
  );

create policy leave_requests_parent_select on public.leave_requests
  for select to authenticated
  using (student_id in (select public.get_auth_user_parent_student_ids()));

create policy leave_requests_parent_insert on public.leave_requests
  for insert to authenticated
  with check (
    student_id in (select public.get_auth_user_parent_student_ids())
    and created_by = auth.uid()
  );

create policy student_pickup_persons_parent_select on public.student_pickup_persons
  for select to authenticated
  using (student_id in (select public.get_auth_user_parent_student_ids()));

create policy student_parents_parent_select on public.student_parents
  for select to authenticated
  using (student_id in (select public.get_auth_user_parent_student_ids()));

create policy student_emergency_contacts_parent_select on public.student_emergency_contacts
  for select to authenticated
  using (student_id in (select public.get_auth_user_parent_student_ids()));

create policy classes_parent_select on public.classes
  for select to authenticated
  using (
    id in (
      select s.current_class_id
      from public.students s
      where s.id in (select public.get_auth_user_parent_student_ids())
        and s.current_class_id is not null
    )
  );
