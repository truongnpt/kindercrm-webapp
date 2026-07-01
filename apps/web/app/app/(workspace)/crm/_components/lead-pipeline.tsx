'use client';

import Link from 'next/link';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { Trans } from '@kit/ui/trans';

import pathsConfig from '~/config/paths.config';
import type { LeadRow } from '~/lib/kinder/crm/load-leads';
import {
  ACTIVE_PIPELINE_STAGES,
  LEAD_STAGE_I18N_KEYS,
  type LeadStage,
} from '~/lib/kinder/crm/pipeline-stages';
import { updateLeadStageAction } from '~/lib/kinder/crm/server-actions';

export function LeadPipelineBoard({
  leads,
  schoolId,
}: {
  leads: LeadRow[];
  schoolId: string;
}) {
  return (
    <div className="grid gap-4 overflow-x-auto lg:grid-cols-3 xl:grid-cols-6">
      {ACTIVE_PIPELINE_STAGES.map((stage) => (
        <PipelineColumn
          key={stage}
          leads={leads.filter((lead) => lead.stage === stage)}
          schoolId={schoolId}
          stage={stage}
        />
      ))}
    </div>
  );
}

function PipelineColumn({
  stage,
  leads,
  schoolId,
}: {
  stage: LeadStage;
  leads: LeadRow[];
  schoolId: string;
}) {
  return (
    <div className="bg-muted/30 min-w-[220px] rounded-lg border p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">
          <Trans i18nKey={LEAD_STAGE_I18N_KEYS[stage]} />
        </h3>
        <Badge variant="secondary">{leads.length}</Badge>
      </div>

      <div className="space-y-2">
        {leads.map((lead) => (
          <LeadPipelineCard key={lead.id} lead={lead} schoolId={schoolId} />
        ))}
      </div>
    </div>
  );
}

function LeadPipelineCard({
  lead,
  schoolId,
}: {
  lead: LeadRow;
  schoolId: string;
}) {
  return (
    <div className="bg-background space-y-2 rounded-md border p-3 shadow-sm">
      <Link
        className="font-medium hover:underline"
        href={`${pathsConfig.app.crmLead}/${lead.id}`}
      >
        {lead.parent_name}
      </Link>
      <p className="text-muted-foreground text-xs">{lead.phone}</p>
      {lead.source?.name ? (
        <Badge className="text-xs" variant="outline">
          {lead.source.name}
        </Badge>
      ) : null}

      <Select
        onValueChange={(value) => {
          void updateLeadStageAction({
            leadId: lead.id,
            schoolId,
            stage: value as LeadStage,
          });
        }}
        value={lead.stage}
      >
        <SelectTrigger className="h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {[...ACTIVE_PIPELINE_STAGES, 'lost' as const].map((stage) => (
            <SelectItem key={stage} value={stage}>
              <Trans i18nKey={LEAD_STAGE_I18N_KEYS[stage]} />
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function LeadListTable({ leads }: { leads: LeadRow[] }) {
  if (leads.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        <Trans i18nKey="kinder:crm.empty" />
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 border-b">
          <tr>
            <th className="px-4 py-3 text-left font-medium">
              <Trans i18nKey="kinder:crm.parentName" />
            </th>
            <th className="px-4 py-3 text-left font-medium">
              <Trans i18nKey="kinder:crm.phone" />
            </th>
            <th className="px-4 py-3 text-left font-medium">
              <Trans i18nKey="kinder:crm.source" />
            </th>
            <th className="px-4 py-3 text-left font-medium">
              <Trans i18nKey="kinder:crm.stage" />
            </th>
            <th className="px-4 py-3 text-left font-medium" />
          </tr>
        </thead>
        <tbody className="divide-y">
          {leads.map((lead) => (
            <tr key={lead.id}>
              <td className="px-4 py-3">{lead.parent_name}</td>
              <td className="px-4 py-3">{lead.phone}</td>
              <td className="px-4 py-3">{lead.source?.name ?? '—'}</td>
              <td className="px-4 py-3">
                <Trans i18nKey={LEAD_STAGE_I18N_KEYS[lead.stage]} />
              </td>
              <td className="px-4 py-3 text-right">
                <Button asChild size="sm" variant="ghost">
                  <Link href={`${pathsConfig.app.crmLead}/${lead.id}`}>
                    <Trans i18nKey="kinder:crm.detail" />
                  </Link>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
