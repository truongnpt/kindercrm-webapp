/*
 * Parent portal — read homeroom teacher profile for linked children
 */

create policy staff_employees_parent_homeroom_select on public.staff_employees
  for select to authenticated
  using (
    user_id in (
      select c.teacher_user_id
      from public.classes c
      join public.students s on s.current_class_id = c.id
      where s.id in (select public.get_auth_user_parent_student_ids())
        and c.teacher_user_id is not null
    )
  );
