'use client';

import { Kanban, List } from 'lucide-react';

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

import { LeadListTable } from './lead-list-table';
import { LeadPipelineBoard } from './lead-pipeline';

export function CrmWorkspace({
  leads,
  schoolId,
  sources,
  members,
}: {
  leads: LeadRow[];
  schoolId: string;
  sources: Array<{ id: string; name: string }>;
  members: Array<{ id: string; name: string; email: string | null }>;
}) {
  return (
    <BentoTile className="min-w-0 overflow-hidden p-0" padding="none">
      <div className="border-b border-border px-5 py-4 sm:px-6">
        <BentoTileHeader
          className="mb-0 border-0 pb-0"
          description={<Trans i18nKey="kinder:crm.workspaceHint" />}
          title={<Trans i18nKey="kinder:crm.pipeline" />}
        />
      </div>

      <TabbedModule className="min-w-0 p-4 gap-0" defaultValue="pipeline">
        <TabbedModuleList className=" mb-4">
          <TabbedModuleTrigger value="pipeline">
            <Kanban className="mr-2 size-4" />
            <Trans i18nKey="kinder:crm.pipeline" />
          </TabbedModuleTrigger>
          <TabbedModuleTrigger value="list">
            <List className="mr-2 size-4" />
            <Trans i18nKey="kinder:crm.list" />
          </TabbedModuleTrigger>
        </TabbedModuleList>

        <TabbedModuleContent
          value="pipeline"
        >
          <LeadPipelineBoard leads={leads} schoolId={schoolId} />
        </TabbedModuleContent>

        <TabbedModuleContent value="list">
          <LeadListTable
            leads={leads}
            members={members}
            schoolId={schoolId}
            sources={sources}
          />
        </TabbedModuleContent>
      </TabbedModule>
    </BentoTile>
  );
}
