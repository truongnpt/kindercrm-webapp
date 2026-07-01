'use client';

import { Settings, Users } from 'lucide-react';

import { Trans } from '@kit/ui/trans';

import {
  BentoTile,
  BentoTileHeader,
  TabbedModule,
  TabbedModuleContent,
  TabbedModuleList,
  TabbedModuleTrigger,
} from '~/components/kinder-ui';
import type { Campus } from '~/lib/kinder/types';
import type {
  StaffDepartment,
  StaffEmployeeListItem,
  StaffPosition,
} from '~/lib/kinder/staff/types';

import { StaffFilters } from './staff-filters';
import { StaffList } from './staff-list';
import { StaffSetupPanel } from './staff-setup-panel';

export function StaffWorkspace({
  employees,
  departments,
  positions,
  campuses,
  schoolId,
  canManage,
  defaultTab,
}: {
  employees: StaffEmployeeListItem[];
  departments: StaffDepartment[];
  positions: StaffPosition[];
  campuses: Campus[];
  schoolId: string;
  canManage: boolean;
  defaultTab: string;
}) {
  return (
    <BentoTile className="min-w-0 overflow-hidden p-0" padding="none">
      <div className="border-b border-border px-5 py-4 sm:px-6">
        <BentoTileHeader
          className="mb-0 border-0 pb-0"
          description={<Trans i18nKey="kinder:staff.workspaceHint" />}
          title={<Trans i18nKey="kinder:staff.tabs.employees" />}
        />
      </div>

      <TabbedModule className="min-w-0 p-4 gap-0" defaultValue={defaultTab}>
        <TabbedModuleList>
          <TabbedModuleTrigger value="employees">
            <Users className="mr-2 size-4" />
            <Trans i18nKey="kinder:staff.tabs.employees" />
          </TabbedModuleTrigger>
          {canManage ? (
            <TabbedModuleTrigger value="setup">
              <Settings className="mr-2 size-4" />
              <Trans i18nKey="kinder:staff.tabs.setup" />
            </TabbedModuleTrigger>
          ) : null}
        </TabbedModuleList>

        <TabbedModuleContent
          className="min-w-0 px-5 py-5 sm:px-6"
          value="employees"
        >
          {canManage ? (
            <div className="mb-4">
              <StaffFilters departments={departments} />
            </div>
          ) : null}

          <StaffList
            campuses={campuses}
            canManage={canManage}
            departments={departments}
            employees={employees}
            positions={positions}
            schoolId={schoolId}
          />
        </TabbedModuleContent>

        {canManage ? (
          <TabbedModuleContent
            className="px-5 pb-5 sm:px-6 sm:pb-6"
            value="setup"
          >
            <StaffSetupPanel
              departments={departments}
              positions={positions}
              schoolId={schoolId}
            />
          </TabbedModuleContent>
        ) : null}
      </TabbedModule>
    </BentoTile>
  );
}
