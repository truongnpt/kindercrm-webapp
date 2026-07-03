import {
  AlertTriangle,
  FileSignature,
  FileText,
  Timer,
} from 'lucide-react';

import { BentoGrid, StatCard } from '~/components/kinder-ui';
import type { StudentContractsSummary } from '~/lib/kinder/student-contracts/types';

export function StudentContractsOverview({
  summary,
}: {
  summary: StudentContractsSummary;
}) {
  return (
    <BentoGrid className="mb-2" columns={4}>
      <StatCard
        icon={FileText}
        labelKey="kinder:studentContracts.summary.total"
        tone="default"
        value={String(summary.total)}
      />
      <StatCard
        icon={FileSignature}
        labelKey="kinder:studentContracts.summary.active"
        tone="success"
        value={String(summary.active)}
      />
      <StatCard
        icon={Timer}
        labelKey="kinder:studentContracts.summary.draft"
        tone="default"
        value={String(summary.draft)}
      />
      <StatCard
        icon={AlertTriangle}
        labelKey="kinder:studentContracts.summary.expiringSoon"
        tone="warning"
        value={String(summary.expiringSoon)}
      />
    </BentoGrid>
  );
}
