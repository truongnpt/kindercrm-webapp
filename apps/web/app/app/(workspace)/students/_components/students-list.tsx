'use client';

import { useMemo, useState } from 'react';

import Link from 'next/link';

import { GraduationCap } from 'lucide-react';

import { Trans } from '@kit/ui/trans';

import { StudentImportExport } from './student-import-export';
import { StudentStatusFilter } from './student-status-filter';
import { Suspense } from 'react';

import {
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
import { StudentAvatar } from './student-avatar';
import type { StudentsWorkspaceProps } from './students-workspace';
import { BaseTable } from '@/app/app/_components/base-table';
import { ColumnDef } from '@tanstack/react-table';

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

interface StudentListProp extends StudentsWorkspaceProps { }

export function StudentsList({
  data,
  schoolId,
}: StudentListProp) {
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [deleteStudent, setDeleteStudent] = useState<Student | null>(null);

  const deleteMutation = useKinderMutation({
    mutationFn: deleteStudentAction,
    invalidateKeys: [kinderQueryKeys.students.list(schoolId)],
    refresh: false,
    onSuccess: () => setDeleteStudent(null),
  });

  const columns: ColumnDef<Student>[] = [
    {
      accessorKey: 'photo_url',
      header: () => <Trans i18nKey="kinder:students.photo" />,
      cell: ({ row }) => (
        <StudentAvatar
          name={row.original.full_name}
          photoUrl={row.original.photo_url}
          size="sm"
        />
      ),
    },
    {
      accessorKey: 'student_code',
      header: () => <Trans i18nKey="kinder:students.code" />,
    },
    {
      accessorKey: 'full_name',
      header: () =><Trans i18nKey="kinder:students.fullName" />,
      cell: ({ row }) => (
        <Link
          className="font-medium hover:text-primary hover:underline"
          href={`${pathsConfig.app.studentDetail}/${row.original.id}`}
        >
          {row.original.full_name}
        </Link>
      ),
    },
    {
      accessorKey: 'class_name',
      header: () => <Trans i18nKey="kinder:students.className" />,
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.class_name ?? '—'}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: () => <Trans i18nKey="kinder:students.status" />,
      cell: ({ row }) => (
        <StatusBadge tone={STATUS_TONE[row.original.status]}>
          <Trans
            i18nKey={`kinder:students.statuses.${row.original.status}`}
          />
        </StatusBadge>
      ),
    },
    {
      accessorKey: 'actions',
      header: () => null,
      cell: ({ row }) => (
        <EntityRowActions
          onDelete={() => setDeleteStudent(row.original)}
          onEdit={() => setEditStudent(row.original)}
        />
      ),
    },
  ]

  const toolbar = useMemo<React.ReactNode>(() => (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <Suspense>
        <StudentStatusFilter />
      </Suspense>
    </div>
  ), [])

  return (
    <>
      <BaseTable columns={columns} data={data.data} pagination={data.pagination} toolbarActions={toolbar} />

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
