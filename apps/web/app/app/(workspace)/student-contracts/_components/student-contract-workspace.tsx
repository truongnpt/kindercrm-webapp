'use client';

import { Suspense } from 'react';

import { Trans } from '@kit/ui/trans';

import {
  BentoTile,
  BentoTileHeader,
} from '~/components/kinder-ui';

import { StudentContractsList } from './student-contracts-list';

import type { StudentContractWithInvoice } from '~/lib/kinder/student-contracts/types';
import { PaginatedResponse } from '~/lib/kinder/types/pagination';

export interface StudentContractsWorkspaceProps {
  data: PaginatedResponse<StudentContractWithInvoice>;
  schoolId: string;
  canManage: boolean;
}

export function StudentContractsWorkspace({
  data,
  schoolId,
  canManage,
}: StudentContractsWorkspaceProps) {
  return (
    <BentoTile className="min-w-0 overflow-hidden p-0" padding="none">
      <div className="border-b border-border px-5 py-4 sm:px-6">
        <BentoTileHeader
          className="mb-0 border-0 pb-0"
          title={
            <Trans i18nKey="kinder:studentContracts.listDescription" />
          }
          description={
            <Trans i18nKey="kinder:studentContracts.listTitle" />
          }
        />
      </div>

      <div className="px-5 py-5 sm:px-6 sm:py-6">
        <Suspense>
          <StudentContractsList
            schoolId={schoolId}
            data={data}
            canManage={canManage}
          />
        </Suspense>
      </div>
    </BentoTile>
  );
}