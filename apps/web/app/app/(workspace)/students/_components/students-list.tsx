'use client';

import { useState } from 'react';

import Link from 'next/link';

import { GraduationCap } from 'lucide-react';

import { Trans } from '@kit/ui/trans';

import {
  DataTableCard,
  EmptyState,
  EntityRowActions,
  KinderConfirmDialog,
  kinderQueryKeys,
  StatusBadge,
  useKinderMutation,
} from '~/components/kinder-ui';
import pathsConfig from '~/config/paths.config';
import { deleteStudentAction } from '~/lib/kinder/students/server-actions';
import type { Student } from '~/lib/kinder/students/types';

import { EditStudentDialog } from './edit-student-dialog';

const STATUS_TONE: Record<
  Student['status'],
  'default' | 'success' | 'muted' | 'warning'
> = {
  active: 'success',
  inactive: 'muted',
  graduated: 'default',
  transferred: 'warning',
  withdrawn: 'muted',
};

export function StudentsList({
  students,
  schoolId,
}: {
  students: Student[];
  schoolId: string;
}) {
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [deleteStudent, setDeleteStudent] = useState<Student | null>(null);

  const deleteMutation = useKinderMutation({
    mutationFn: deleteStudentAction,
    invalidateKeys: [kinderQueryKeys.students.list(schoolId)],
    refresh: false,
    onSuccess: () => setDeleteStudent(null),
  });

  if (students.length === 0) {
    return (
      <EmptyState
        descriptionKey="kinder:ui.emptyDefaultDescription"
        icon={GraduationCap}
        titleKey="kinder:students.empty"
      />
    );
  }

  return (
    <>
      <div className="hidden md:block">
        <DataTableCard
          description={<Trans i18nKey="kinder:students.listDescription" />}
          title={<Trans i18nKey="kinder:students.directory" />}
        >
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th>
                  <Trans i18nKey="kinder:students.code" />
                </th>
                <th>
                  <Trans i18nKey="kinder:students.fullName" />
                </th>
                <th>
                  <Trans i18nKey="kinder:students.className" />
                </th>
                <th>
                  <Trans i18nKey="kinder:students.status" />
                </th>
                <th className="text-right" />
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td className="font-mono text-xs">{student.student_code}</td>
                  <td>
                    <Link
                      className="font-medium hover:text-primary hover:underline"
                      href={`${pathsConfig.app.studentDetail}/${student.id}`}
                    >
                      {student.full_name}
                    </Link>
                  </td>
                  <td className="text-muted-foreground">
                    {student.class_name ?? '—'}
                  </td>
                  <td>
                    <StatusBadge tone={STATUS_TONE[student.status]}>
                      <Trans
                        i18nKey={`kinder:students.statuses.${student.status}`}
                      />
                    </StatusBadge>
                  </td>
                  <td className="text-right">
                    <EntityRowActions
                      onDelete={() => setDeleteStudent(student)}
                      onEdit={() => setEditStudent(student)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DataTableCard>
      </div>

      <div className="space-y-3 md:hidden">
        {students.map((student) => (
          <article className="kinder-mobile-card" key={student.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Link
                  className="text-foreground truncate font-medium hover:text-primary hover:underline"
                  href={`${pathsConfig.app.studentDetail}/${student.id}`}
                >
                  {student.full_name}
                </Link>
                <p className="text-muted-foreground mt-0.5 font-mono text-xs">
                  {student.student_code}
                </p>
              </div>
              <StatusBadge tone={STATUS_TONE[student.status]}>
                <Trans
                  i18nKey={`kinder:students.statuses.${student.status}`}
                />
              </StatusBadge>
            </div>

            <div className="text-muted-foreground text-sm">
              <Trans i18nKey="kinder:students.className" />:{' '}
              <span className="text-foreground">
                {student.class_name ?? '—'}
              </span>
            </div>

            <EntityRowActions
              onDelete={() => setDeleteStudent(student)}
              onEdit={() => setEditStudent(student)}
            />
          </article>
        ))}
      </div>

      {editStudent ? (
        <EditStudentDialog
          hideTrigger
          onOpenChange={(open) => {
            if (!open) {
              setEditStudent(null);
            }
          }}
          open
          schoolId={schoolId}
          student={editStudent}
        />
      ) : null}

      <KinderConfirmDialog
        description={<Trans i18nKey="kinder:ui.confirmDeleteDescription" />}
        onConfirm={() => {
          if (deleteStudent) {
            deleteMutation.mutate({
              studentId: deleteStudent.id,
              schoolId,
            });
          }
        }}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteStudent(null);
          }
        }}
        open={Boolean(deleteStudent)}
        pending={deleteMutation.isPending}
        title={<Trans i18nKey="kinder:ui.confirmDelete" />}
        confirmLabel={<Trans i18nKey="kinder:students.delete" />}
      />
    </>
  );
}
