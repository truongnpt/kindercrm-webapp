import { Trans } from '@kit/ui/trans';

import type { StudentHealthSummary } from '~/lib/kinder/health/types';

export function HealthProfilesPanel({
  summaries,
}: {
  summaries: StudentHealthSummary[];
}) {
  if (summaries.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        <Trans i18nKey="kinder:health.emptyStudents" />
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 border-b">
          <tr>
            <th className="px-4 py-3 text-left">
              <Trans i18nKey="kinder:students.student" />
            </th>
            <th className="px-4 py-3 text-left">
              <Trans i18nKey="kinder:health.allergies" />
            </th>
            <th className="px-4 py-3 text-left">
              <Trans i18nKey="kinder:health.height" />
            </th>
            <th className="px-4 py-3 text-left">
              <Trans i18nKey="kinder:health.weight" />
            </th>
            <th className="px-4 py-3 text-left">BMI</th>
          </tr>
        </thead>
        <tbody>
          {summaries.map((row) => (
            <tr className="border-b last:border-b-0" key={row.studentId}>
              <td className="px-4 py-3">
                <p className="font-medium">{row.fullName}</p>
                <p className="text-muted-foreground text-xs">{row.studentCode}</p>
              </td>
              <td className="px-4 py-3">{row.allergyCount}</td>
              <td className="px-4 py-3">
                {row.latestHeightCm ? `${row.latestHeightCm} cm` : '—'}
              </td>
              <td className="px-4 py-3">
                {row.latestWeightKg ? `${row.latestWeightKg} kg` : '—'}
              </td>
              <td className="px-4 py-3">{row.latestBmi ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
