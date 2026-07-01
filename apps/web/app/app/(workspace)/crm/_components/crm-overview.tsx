import {
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';


import { BentoGrid, StatCard } from '~/components/kinder-ui';
import type { LeadRow } from '~/lib/kinder/crm/load-leads';

export function CrmOverview({ leads }: { leads: LeadRow[] }) {
  const total = leads.length;
  const inPipeline = leads.filter(
    (lead) => lead.status === 'active' && lead.stage !== 'lost',
  ).length;
  const enrolled = leads.filter((lead) => lead.stage === 'enrolled').length;
  const newLeads = leads.filter((lead) => lead.stage === 'new').length;

  return (
    <BentoGrid className="mb-2" columns={4}>
      <StatCard
        icon={Users}
        labelKey="kinder:crm.stats.totalLeads"
        tone="default"
        value={String(total)}
      />
      <StatCard
        icon={Target}
        labelKey="kinder:crm.stats.inPipeline"
        tone="info"
        value={String(inPipeline)}
      />
      <StatCard
        icon={TrendingUp}
        labelKey="kinder:crm.stats.enrolled"
        tone="success"
        value={String(enrolled)}
      />
      <StatCard
        icon={Sparkles}
        labelKey="kinder:crm.stats.newLeads"
        tone="warning"
        value={String(newLeads)}
      />
    </BentoGrid>
  );
}
