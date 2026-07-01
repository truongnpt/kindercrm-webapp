'use client';

import { Suspense } from 'react';

import { Trans } from '@kit/ui/trans';

import {
  BentoTile,
  BentoTileHeader,
} from '~/components/kinder-ui';
import type { Student } from '~/lib/kinder/students/types';

import { StudentImportExport } from './student-import-export';
import { StudentStatusFilter } from './student-status-filter';
import { StudentsList } from './students-list';

export function StudentsWorkspace({
  students,
  schoolId,
}: {
  students: Student[];
  schoolId: string;
}) {
  return (
    <BentoTile className="min-w-0 overflow-hidden p-0" padding="none">
      <div className="border-b border-border px-5 py-4 sm:px-6">
        <BentoTileHeader
          className="mb-0 border-0 pb-0"
          description={<Trans i18nKey="kinder:students.workspaceHint" />}
          title={<Trans i18nKey="kinder:students.directory" />}
        />
      </div>

      <div className="border-b border-border px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Suspense>
            <StudentStatusFilter />
          </Suspense>
          <StudentImportExport schoolId={schoolId} students={students} />
        </div>
      </div>

      <div className="px-5 py-5 sm:px-6 sm:py-6">
        <StudentsList schoolId={schoolId} students={students} />
      </div>
    </BentoTile>
  );
}
