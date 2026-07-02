'use client';

import { Trans } from '@kit/ui/trans';

import {
  BentoTile,
  BentoTileHeader,
} from '~/components/kinder-ui';
import type { Campus } from '~/lib/kinder/types';
import type {
  StaffDepartment,
  StaffEmployeeListItem,
  StaffPosition,
} from '~/lib/kinder/staff/types';

import { StaffList } from './staff-list';

export function StaffWorkspace({
  employees,
  departments,
  positions,
  campuses,
  schoolId,
  canManage,
  hasActiveFilters,
}: {
  employees: StaffEmployeeListItem[];
  departments: StaffDepartment[];
  positions: StaffPosition[];
  campuses: Campus[];
  schoolId: string;
  canManage: boolean;
  hasActiveFilters: boolean;
}) {
  return (
    <BentoTile className="min-w-0 overflow-hidden p-0" padding="none">
      <div className="border-b border-border px-5 py-4 sm:px-6">
        <BentoTileHeader
          className="mb-0 border-0 pb-0"
          description={<Trans i18nKey="kinder:staff.workspaceHint" />}
          title={<Trans i18nKey="kinder:staff.directory" />}
        />
      </div>

      <div className="px-5 py-5 sm:px-6 sm:py-6">
        <StaffList
          campuses={campuses}
          canManage={canManage}
          departments={departments}
          employees={employees}
          hasActiveFilters={hasActiveFilters}
          positions={positions}
          schoolId={schoolId}
        />
      </div>
    </BentoTile>
  );
}
