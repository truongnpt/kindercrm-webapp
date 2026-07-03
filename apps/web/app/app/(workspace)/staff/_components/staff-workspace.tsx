'use client';

import { Trans } from '@kit/ui/trans';

import {
  BentoTile,
  BentoTileHeader,
} from '~/components/kinder-ui';
import type { SchoolCustomRole, StaffModulePermissions } from '~/lib/kinder/permissions';
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
  managers,
  customRoles,
  schoolId,
  permissions,
  hasActiveFilters,
}: {
  employees: StaffEmployeeListItem[];
  departments: StaffDepartment[];
  positions: StaffPosition[];
  campuses: Campus[];
  managers: Array<Pick<StaffEmployeeListItem, 'id' | 'full_name' | 'employee_code'>>;
  customRoles: SchoolCustomRole[];
  schoolId: string;
  permissions: StaffModulePermissions;
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
          customRoles={customRoles}
          managers={managers}
          permissions={permissions}
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
