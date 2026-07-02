import {
  Activity,
  AlertTriangle,
  Pill,
  Syringe,
  TrendingUp,
  Users,
} from 'lucide-react';

import { BentoGrid, StatCard } from '~/components/kinder-ui';
import type { HealthDashboardSummary } from '~/lib/kinder/health/types';

export function HealthOverview({
  summary,
}: {
  summary: HealthDashboardSummary;
}) {
  return (
    <BentoGrid className="mb-2" columns={3}>
      <StatCard
        icon={Users}
        labelKey="kinder:health.summary.students"
        tone="default"
        value={String(summary.totalStudents)}
      />
      <StatCard
        icon={AlertTriangle}
        labelKey="kinder:health.summary.allergies"
        tone="warning"
        value={String(summary.studentsWithAllergies)}
      />
      <StatCard
        icon={Syringe}
        labelKey="kinder:health.summary.vaccinationsDue"
        tone="info"
        value={String(summary.vaccinationsDueSoon)}
      />
      <StatCard
        icon={Activity}
        labelKey="kinder:health.summary.incidentsMonth"
        tone="danger"
        value={String(summary.incidentsThisMonth)}
      />
      <StatCard
        icon={TrendingUp}
        labelKey="kinder:health.summary.growthMonth"
        tone="success"
        value={String(summary.growthRecordsThisMonth)}
      />
      <StatCard
        icon={Pill}
        labelKey="kinder:health.summary.activeMedications"
        tone="default"
        value={String(summary.activeMedications)}
      />
    </BentoGrid>
  );
}
