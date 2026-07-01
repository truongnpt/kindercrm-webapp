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
import type { LeadRow } from '~/lib/kinder/crm/load-leads';

import { LeadDetailBento } from './lead-detail-bento';
import { LeadNotesPanel } from './lead-notes-panel';

export function LeadDetailWorkspace({
  lead,
  members,
  leadId,
  schoolId,
  notes,
  activities,
}: {
  lead: LeadRow;
  members: Array<{ id: string; name: string; email: string | null }>;
  leadId: string;
  schoolId: string;
  notes: Array<{ id: string; body: string; created_at: string }>;
  activities: Array<{
    id: string;
    activity_type: string;
    description: string | null;
    created_at: string;
  }>;
}) {
  return (
    <BentoTile className="min-w-0 overflow-hidden p-0" padding="none">
      <div className="border-b border-border px-5 py-4 sm:px-6">
        <BentoTileHeader
          className="mb-0 border-0 pb-0"
          description={<Trans i18nKey="kinder:crm.detailHint" />}
          title={<Trans i18nKey="kinder:crm.detail" />}
        />
      </div>

      <TabbedModule className="min-w-0 p-4 gap-0" defaultValue="profile">
        <TabbedModuleList>
          <TabbedModuleTrigger value="profile">
            <Trans i18nKey="kinder:crm.leadProfile" />
          </TabbedModuleTrigger>
          <TabbedModuleTrigger value="activity">
            <Trans i18nKey="kinder:crm.timeline" />
          </TabbedModuleTrigger>
        </TabbedModuleList>

        <TabbedModuleContent
          className="px-5 py-5 sm:px-6 sm:py-6"
          value="profile"
        >
          <LeadDetailBento lead={lead} members={members} />
        </TabbedModuleContent>

        <TabbedModuleContent
          className="px-5 pb-5 sm:px-6 sm:pb-6"
          value="activity"
        >
          <LeadNotesPanel
            activities={activities}
            leadId={leadId}
            notes={notes}
            schoolId={schoolId}
          />
        </TabbedModuleContent>
      </TabbedModule>
    </BentoTile>
  );
}
