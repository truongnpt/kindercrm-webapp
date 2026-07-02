'use client';

import { Trans } from '@kit/ui/trans';

import { BentoTile, BentoTileHeader } from '~/components/kinder-ui';
import type { School } from '~/lib/kinder/types';

import { UpdateSchoolForm } from './update-school-form';

export function SchoolSettingsWorkspace({ school }: { school: School }) {
  return (
    <BentoTile className="min-w-0 overflow-hidden p-0" padding="none">
      <div className="border-b border-border px-5 py-4 sm:px-6">
        <BentoTileHeader
          className="mb-0 border-0 pb-0"
          description={<Trans i18nKey="kinder:schoolSettings.workspaceHint" />}
          title={<Trans i18nKey="kinder:schoolSettings.workspaceTitle" />}
        />
      </div>

      <div className="px-5 py-5 sm:px-6 sm:py-6">
        <UpdateSchoolForm school={school} />
      </div>
    </BentoTile>
  );
}
