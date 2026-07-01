import { Trans } from '@kit/ui/trans';

import type { HealthDashboardSummary } from '~/lib/kinder/health/types';

export function HealthDashboardPanel({
  summary,
}: {
  summary: HealthDashboardSummary;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div className="rounded-lg border p-4">
        <p className="text-muted-foreground text-xs">
          <Trans i18nKey="kinder:health.summary.students" />
        </p>
        <p className="text-2xl font-semibold">{summary.totalStudents}</p>
      </div>
      <div className="rounded-lg border p-4">
        <p className="text-muted-foreground text-xs">
          <Trans i18nKey="kinder:health.summary.allergies" />
        </p>
        <p className="text-2xl font-semibold">{summary.studentsWithAllergies}</p>
      </div>
      <div className="rounded-lg border p-4">
        <p className="text-muted-foreground text-xs">
          <Trans i18nKey="kinder:health.summary.vaccinationsDue" />
        </p>
        <p className="text-2xl font-semibold">{summary.vaccinationsDueSoon}</p>
      </div>
      <div className="rounded-lg border p-4">
        <p className="text-muted-foreground text-xs">
          <Trans i18nKey="kinder:health.summary.incidentsMonth" />
        </p>
        <p className="text-2xl font-semibold">{summary.incidentsThisMonth}</p>
      </div>
      <div className="rounded-lg border p-4">
        <p className="text-muted-foreground text-xs">
          <Trans i18nKey="kinder:health.summary.growthMonth" />
        </p>
        <p className="text-2xl font-semibold">{summary.growthRecordsThisMonth}</p>
      </div>
      <div className="rounded-lg border p-4">
        <p className="text-muted-foreground text-xs">
          <Trans i18nKey="kinder:health.summary.activeMedications" />
        </p>
        <p className="text-2xl font-semibold">{summary.activeMedications}</p>
      </div>
    </div>
  );
}
