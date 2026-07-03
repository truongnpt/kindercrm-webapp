'use client';

import { useEffect, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { Button } from '@kit/ui/button';
import { Form } from '@kit/ui/form';
import { Trans } from '@kit/ui/trans';

import {
  KinderFormDialog,
  KinderSubmitButton,
  kinderQueryKeys,
  useKinderMutation,
} from '~/components/kinder-ui';
import { UpdateStudentSchema } from '~/lib/kinder/students/schemas/student.schema';
import { updateStudentAction } from '~/lib/kinder/students/server-actions';
import type { Student } from '~/lib/kinder/students/types';

import { StudentFormFields } from './student-form-fields';

export function EditStudentDialog({
  student,
  schoolId,
  open: controlledOpen,
  onOpenChange,
  trigger,
  hideTrigger,
}: {
  student: Student;
  schoolId: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  hideTrigger?: boolean;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const form = useForm({
    resolver: zodResolver(UpdateStudentSchema),
    defaultValues: {
      studentId: student.id,
      schoolId,
      fullName: student.full_name,
      dateOfBirth: student.date_of_birth ?? '',
      gender: student.gender ?? undefined,
      className: student.class_name ?? '',
      enrollmentDate: student.enrollment_date ?? '',
      status: student.status,
      notes: student.notes ?? '',
      photoUrl: student.photo_url ?? '',
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        studentId: student.id,
        schoolId,
        fullName: student.full_name,
        dateOfBirth: student.date_of_birth ?? '',
        gender: student.gender ?? undefined,
        className: student.class_name ?? '',
        enrollmentDate: student.enrollment_date ?? '',
        status: student.status,
        notes: student.notes ?? '',
        photoUrl: student.photo_url ?? '',
      });
    }
  }, [open, student, schoolId, form]);

  const updateStudent = useKinderMutation({
    mutationFn: updateStudentAction,
    invalidateKeys: [
      kinderQueryKeys.students.detail(schoolId, student.id),
      kinderQueryKeys.students.list(schoolId),
    ],
    onSuccess: () => setOpen(false),
  });

  return (
    <KinderFormDialog
      description={<Trans i18nKey="kinder:students.detail" />}
      onOpenChange={setOpen}
      open={open}
      size="lg"
      title={<Trans i18nKey="kinder:ui.edit" />}
      trigger={
        hideTrigger ? undefined : (
          trigger ?? (
            <Button size="sm" type="button" variant="outline">
              <Pencil className="mr-2 size-4" />
              <Trans i18nKey="kinder:ui.edit" />
            </Button>
          )
        )
      }
      footer={
        <KinderSubmitButton
          loading={updateStudent.isPending}
          onClick={form.handleSubmit((data) => updateStudent.mutate(data))}
          type="button"
        >
          <Trans i18nKey="kinder:students.save" />
        </KinderSubmitButton>
      }
    >
      <Form {...form}>
        <form className="flex flex-col gap-4">
          <StudentFormFields
            form={form}
            schoolId={schoolId}
            showCode={student.student_code}
            studentId={student.id}
          />
        </form>
      </Form>
    </KinderFormDialog>
  );
}
