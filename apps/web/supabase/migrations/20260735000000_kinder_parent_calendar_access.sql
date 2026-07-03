/*
 * PARENT-011 — Parent portal read access to calendar events
 */

create policy calendar_events_parent_select on public.calendar_events
  for select to authenticated
  using (
    deleted_at is null
    and exists (
      select 1
      from public.parent_student_links psl
      where psl.user_id = auth.uid()
        and psl.school_id = calendar_events.school_id
    )
    and (
      scope_type = 'school'
      or (
        scope_type = 'class'
        and class_id in (
          select s.current_class_id
          from public.students s
          inner join public.parent_student_links psl on psl.student_id = s.id
          where psl.user_id = auth.uid()
            and s.deleted_at is null
            and s.current_class_id is not null
        )
      )
      or (
        scope_type = 'campus'
        and campus_id in (
          select c.campus_id
          from public.classes c
          inner join public.students s on s.current_class_id = c.id
          inner join public.parent_student_links psl on psl.student_id = s.id
          where psl.user_id = auth.uid()
            and s.deleted_at is null
            and c.campus_id is not null
        )
      )
    )
  );
