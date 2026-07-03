'use client';

import { useState } from 'react';

import { Trash2 } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';

import {
  KinderConfirmDialog,
  kinderQueryKeys,
  useKinderMutation,
} from '~/components/kinder-ui';
import { deleteStudentAction } from '~/lib/kinder/students/server-actions';
import type { Student } from '~/lib/kinder/students/types';

import { EditStudentDialog } from '../../_components/edit-student-dialog';

export function StudentDetailActions({
  student,
  schoolId,
}: {
  student: Student;
  schoolId: string;
}) {
  const [deleteOpen, setDeleteOpen] = useState(false);

  const deleteStudent = useKinderMutation({
    mutationFn: deleteStudentAction,
    invalidateKeys: [kinderQueryKeys.students.list(schoolId)],
    refresh: false,
    onSuccess: () => setDeleteOpen(false),
  });

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <EditStudentDialog schoolId={schoolId} student={student} />
        <Button
 onClick={() => setDeleteOpen(true)}
          size="sm"
          type="button"
          variant="destructive"
        >
          <Trash2 className="mr-2 size-4" />
          <Trans i18nKey="kinder:ui.delete" />
        </Button>
      </div>

      <KinderConfirmDialog
        description={<Trans i18nKey="kinder:ui.confirmDeleteDescription" />}
        onConfirm={() =>
          deleteStudent.mutate({ studentId: student.id, schoolId })
        }
        onOpenChange={setDeleteOpen}
        open={deleteOpen}
        pending={deleteStudent.isPending}
        title={<Trans i18nKey="kinder:ui.confirmDelete" />}
        confirmLabel={<Trans i18nKey="kinder:students.delete" />}
      />
    </>
  );
}
