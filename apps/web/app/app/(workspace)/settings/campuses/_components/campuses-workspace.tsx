'use client';

import { Trans } from '@kit/ui/trans';

import { BentoTile, BentoTileHeader } from '~/components/kinder-ui';
import type { Campus } from '~/lib/kinder/types';

import { CampusesList } from './campuses-list';

export function CampusesWorkspace({ campuses }: { campuses: Campus[] }) {
  return (
    <BentoTile className="min-w-0 overflow-hidden p-0" padding="none">
      <div className="border-b border-border px-5 py-4 sm:px-6">
        <BentoTileHeader
          className="mb-0 border-0 pb-0"
          description={<Trans i18nKey="kinder:campuses.workspaceHint" />}
          title={<Trans i18nKey="kinder:campuses.workspaceTitle" />}
        />
      </div>

      <div className="px-5 py-5 sm:px-6 sm:py-6">
        <CampusesList campuses={campuses} />
      </div>
    </BentoTile>
  );
}
