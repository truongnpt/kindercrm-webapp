import { Users } from 'lucide-react';

import { Trans } from '@kit/ui/trans';

import { DataTableCard, EmptyState } from '~/components/kinder-ui';
import type { StudentHealthSummary } from '~/lib/kinder/health/types';

export function HealthProfilesPanel({
  summaries,
}: {
  summaries: StudentHealthSummary[];
}) {
  if (summaries.length === 0) {
    return (
      <EmptyState
        compact
        descriptionKey="kinder:health.emptyStudentsDescription"
        icon={Users}
        titleKey="kinder:health.emptyStudents"
      />
    );
  }

  return (
    <>
      <div className="hidden md:block">
        <DataTableCard
          description={<Trans i18nKey="kinder:health.profilesListDescription" />}
          title={<Trans i18nKey="kinder:health.tabs.profiles" />}
        >
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th>
                  <Trans i18nKey="kinder:students.student" />
                </th>
                <th>
                  <Trans i18nKey="kinder:health.allergies" />
                </th>
                <th>
                  <Trans i18nKey="kinder:health.height" />
                </th>
                <th>
                  <Trans i18nKey="kinder:health.weight" />
                </th>
                <th>BMI</th>
              </tr>
            </thead>
            <tbody>
              {summaries.map((row) => (
                <tr key={row.studentId}>
                  <td>
                    <p className="font-medium">{row.fullName}</p>
                    <p className="text-muted-foreground text-xs">
                      {row.studentCode}
                    </p>
                  </td>
                  <td>{row.allergyCount}</td>
                  <td>
                    {row.latestHeightCm ? `${row.latestHeightCm} cm` : '—'}
                  </td>
                  <td>
                    {row.latestWeightKg ? `${row.latestWeightKg} kg` : '—'}
                  </td>
                  <td>{row.latestBmi ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </DataTableCard>
      </div>

      <div className="space-y-3 md:hidden">
        {summaries.map((row) => (
          <article className="kinder-mobile-card" key={row.studentId}>
            <p className="font-medium">{row.fullName}</p>
            <p className="text-muted-foreground text-xs">{row.studentCode}</p>
            <div className="text-muted-foreground mt-3 grid grid-cols-2 gap-2 text-sm">
              <p>
                <Trans i18nKey="kinder:health.allergies" />: {row.allergyCount}
              </p>
              <p>
                BMI: {row.latestBmi ?? '—'}
              </p>
              <p>
                <Trans i18nKey="kinder:health.height" />:{' '}
                {row.latestHeightCm ? `${row.latestHeightCm} cm` : '—'}
              </p>
              <p>
                <Trans i18nKey="kinder:health.weight" />:{' '}
                {row.latestWeightKg ? `${row.latestWeightKg} kg` : '—'}
              </p>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
