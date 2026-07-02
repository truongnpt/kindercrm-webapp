'use client';

import { Trans } from '@kit/ui/trans';

import {
  BentoTile,
  BentoTileHeader,
} from '~/components/kinder-ui';
import type { StaffDepartment } from '~/lib/kinder/staff/types';

import { StaffSetupPanel } from './staff-setup-panel';

export function StaffSetupWorkspace({
  schoolId,
  departments,
  positions,
}: {
  schoolId: string;
  departments: StaffDepartment[];
  positions: Array<{ id: string; name: string; department_id: string | null }>;
}) {
  return (
    <BentoTile className="min-w-0 overflow-hidden p-0" padding="none">
      <div className="border-b border-border px-5 py-4 sm:px-6">
        <BentoTileHeader
          className="mb-0 border-0 pb-0"
          description={<Trans i18nKey="kinder:staff.setupHint" />}
          title={<Trans i18nKey="kinder:staff.tabs.setup" />}
        />
      </div>

      <div className="px-5 py-5 sm:px-6 sm:py-6">
        <StaffSetupPanel
          departments={departments}
          positions={positions}
          schoolId={schoolId}
        />
      </div>
    </BentoTile>
  );
}
