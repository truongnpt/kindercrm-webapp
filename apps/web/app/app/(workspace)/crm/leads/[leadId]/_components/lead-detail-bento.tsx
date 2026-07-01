import { Badge } from '@kit/ui/badge';
import { Trans } from '@kit/ui/trans';

import { BentoGrid, BentoTile, BentoTileHeader } from '~/components/kinder-ui';
import type { LeadRow } from '~/lib/kinder/crm/load-leads';
import { LEAD_STAGE_I18N_KEYS } from '~/lib/kinder/crm/pipeline-stages';

function InfoRow({
  label,
  value,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 border-border/25 border-b py-3 last:border-0">
      <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        {label}
      </dt>
      <dd className="text-foreground text-sm font-medium">{value}</dd>
    </div>
  );
}

export function LeadDetailBento({
  lead,
  members,
}: {
  lead: LeadRow;
  members: Array<{ id: string; name: string; email: string | null }>;
}) {
  const assignee = members.find((m) => m.id === lead.assigned_to);

  return (
    <BentoGrid>
      <BentoTile colSpan={2}>
        <BentoTileHeader
          title={<Trans i18nKey="kinder:crm.parentName" />}
          description={lead.phone}
        />
        <dl>
          <InfoRow label={<Trans i18nKey="kinder:crm.parentName" />} value={lead.parent_name} />
          <InfoRow
            label={<Trans i18nKey="kinder:crm.email" />}
            value={lead.email ?? '—'}
          />
          <InfoRow
            label={<Trans i18nKey="kinder:crm.phone" />}
            value={lead.phone}
          />
        </dl>
      </BentoTile>

      <BentoTile colSpan={2}>
        <BentoTileHeader title={<Trans i18nKey="kinder:crm.childName" />} />
        <dl>
          <InfoRow
            label={<Trans i18nKey="kinder:crm.childName" />}
            value={lead.child_name ?? '—'}
          />
          <InfoRow
            label={<Trans i18nKey="kinder:crm.childDob" />}
            value={lead.child_dob ?? '—'}
          />
        </dl>
      </BentoTile>

      <BentoTile colSpan={2}>
        <BentoTileHeader title={<Trans i18nKey="kinder:crm.pipeline" />} />
        <div className="flex flex-col gap-3">
          <Badge className="w-fit">
            <Trans i18nKey={LEAD_STAGE_I18N_KEYS[lead.stage]} />
          </Badge>
          <InfoRow
            label={<Trans i18nKey="kinder:crm.source" />}
            value={lead.source?.name ?? '—'}
          />
          <InfoRow
            label={<Trans i18nKey="kinder:crm.assignedTo" />}
            value={assignee?.name ?? <Trans i18nKey="kinder:crm.unassigned" />}
          />
        </div>
      </BentoTile>

      <BentoTile colSpan={2}>
        <BentoTileHeader title={<Trans i18nKey="kinder:crm.notes" />} />
        <p className="text-muted-foreground text-sm leading-relaxed">
          {lead.notes ?? '—'}
        </p>
      </BentoTile>
    </BentoGrid>
  );
}
