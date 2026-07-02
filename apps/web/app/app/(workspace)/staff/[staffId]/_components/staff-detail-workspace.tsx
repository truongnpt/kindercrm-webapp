'use client';

import { Trans } from '@kit/ui/trans';

import {
  BentoTile,
  BentoTileHeader,
  TabbedModule,
  TabbedModuleContent,
  TabbedModuleList,
  TabbedModuleTrigger,
} from '~/components/kinder-ui';
import type { StaffModulePermissions } from '~/lib/kinder/permissions';
import type { StaffHomeroomClass } from '~/lib/kinder/staff/types';
import type {
  StaffContract,
  StaffEmployeeDetail,
} from '~/lib/kinder/staff/types';

import { StaffClassesPanel } from './staff-classes-panel';
import { StaffContractsPanel } from './staff-contracts-panel';
import { StaffProfileBento } from './staff-profile-bento';

export function StaffDetailWorkspace({
  employee,
  activeContract,
  contracts,
  homeroomClasses,
  assignments,
  availableClasses,
  schoolId,
  permissions,
}: {
  employee: StaffEmployeeDetail;
  activeContract?: StaffContract;
  contracts: StaffContract[];
  homeroomClasses: StaffHomeroomClass[];
  assignments: Array<{
    id: string;
    assignment_role: string;
    class: StaffHomeroomClass;
  }>;
  availableClasses: Array<{ id: string; name: string; code: string }>;
  schoolId: string;
  permissions: StaffModulePermissions;
}) {
  const showClassesTab =
    employee.is_teacher && permissions.canViewClasses;

  return (
    <BentoTile className="min-w-0 overflow-hidden p-0" padding="none">
      <div className="border-b border-border px-5 py-4 sm:px-6">
        <BentoTileHeader
          className="mb-0 border-0 pb-0"
          description={<Trans i18nKey="kinder:staff.detailHint" />}
          title={<Trans i18nKey="kinder:staff.detail" />}
        />
      </div>

      <TabbedModule className="min-w-0 p-4 gap-0" defaultValue="profile">
        <TabbedModuleList>
          <TabbedModuleTrigger value="profile">
            <Trans i18nKey="kinder:staff.tabs.profile" />
          </TabbedModuleTrigger>
          {permissions.canViewContracts ? (
            <TabbedModuleTrigger value="contracts">
              <Trans i18nKey="kinder:staff.contracts.title" />
            </TabbedModuleTrigger>
          ) : null}
          {showClassesTab ? (
            <TabbedModuleTrigger value="classes">
              <Trans i18nKey="kinder:staff.classes.title" />
            </TabbedModuleTrigger>
          ) : null}
        </TabbedModuleList>

        <TabbedModuleContent
          className="px-5 py-5 sm:px-6 sm:py-6"
          value="profile"
        >
          <StaffProfileBento
            activeContract={activeContract}
            employee={employee}
            permissions={permissions}
            schoolId={schoolId}
          />
        </TabbedModuleContent>

        {permissions.canViewContracts ? (
          <TabbedModuleContent
            className="px-5 pb-5 sm:px-6 sm:pb-6"
            value="contracts"
          >
            <StaffContractsPanel
              canManage={permissions.canManageContracts}
              contracts={contracts}
              employeeId={employee.id}
              schoolId={schoolId}
            />
          </TabbedModuleContent>
        ) : null}

        {showClassesTab ? (
          <TabbedModuleContent
            className="px-5 pb-5 sm:px-6 sm:pb-6"
            value="classes"
          >
            <StaffClassesPanel
              assignments={assignments}
              availableClasses={availableClasses}
              canManage={permissions.canManageClasses}
              employeeId={employee.id}
              homeroomClasses={homeroomClasses}
              schoolId={schoolId}
            />
          </TabbedModuleContent>
        ) : null}
      </TabbedModule>
    </BentoTile>
  );
}
