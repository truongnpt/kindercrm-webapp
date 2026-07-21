'use client';

import { Suspense } from 'react';

import { Trans } from '@kit/ui/trans';

import {
  BentoTile,
  BentoTileHeader,
} from '~/components/kinder-ui';
import type { Student } from '~/lib/kinder/students/types';
import { StudentsList } from './students-list';
import { PaginatedResponse, Pagination } from '~/lib/kinder/types/pagination';

export interface StudentsWorkspaceProps {
  data: PaginatedResponse<Student>;
  schoolId: string;
}
export function StudentsWorkspace({
  data,
  schoolId,
}: StudentsWorkspaceProps) {
  return (
    <BentoTile className="min-w-0 overflow-hidden p-0" padding="none">
      <div className="border-b border-border px-5 py-4 sm:px-6">
        <BentoTileHeader
          className="mb-0 border-0 pb-0"
          description={<Trans i18nKey="kinder:students.workspaceHint" />}
          title={<Trans i18nKey="kinder:students.directory" />}
        />
      </div>
      <div className="px-5 py-5 sm:px-6 sm:py-6">
        <StudentsList schoolId={schoolId} data={data} />
      </div>
    </BentoTile>
  );
}
