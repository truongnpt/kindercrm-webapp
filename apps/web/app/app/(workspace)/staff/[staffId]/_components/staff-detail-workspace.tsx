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
  canManage,
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
  canManage: boolean;
}) {
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
          {canManage ? (
            <TabbedModuleTrigger value="contracts">
              <Trans i18nKey="kinder:staff.contracts.title" />
            </TabbedModuleTrigger>
          ) : null}
          {employee.is_teacher ? (
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
          />
        </TabbedModuleContent>

        {canManage ? (
          <TabbedModuleContent
            className="px-5 pb-5 sm:px-6 sm:pb-6"
            value="contracts"
          >
            <StaffContractsPanel
              contracts={contracts}
              employeeId={employee.id}
              schoolId={schoolId}
            />
          </TabbedModuleContent>
        ) : null}

        {employee.is_teacher ? (
          <TabbedModuleContent
            className="px-5 pb-5 sm:px-6 sm:pb-6"
            value="classes"
          >
            <StaffClassesPanel
              assignments={assignments}
              availableClasses={availableClasses}
              canManage={canManage}
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
